import { useCallback } from 'react'
import { getStudentByUid, getStudentByEmail, getStudentByNumericalId, updateStudent, setStudent } from '../services/students'
import { getEnrollmentsByStudent, getGradesByStudent, getAttendanceByStudent } from '../services/enrollments'
import { getNotifications, getUnreadCount } from '../services/notifications'
import { getCourseById } from '../services/courses'
import { updateSessionUserFields } from '../utils/authHelpers'
import { transformDashboardDataFromMySQL } from './useStudentDashboardTransform'

/**
 * Hook for Student.jsx data loading logic
 * Extracts loadStudentProfile function to reduce Student.jsx size (~430 lines)
 */
export function useStudentDataLoading({
  navigate,
  setStudentUid,
  setStudentEmail,
  setStudentName,
  setStudentProfile,
  setStudentMySQLId,
  setStudentPic,
  setProfilePreview,
  setEnrollments,
  setLiveGrades,
  setLiveAttendance,
  setNotifications,
  setUnreadNotificationCount,
  setCourses,
  setData,
  getCurrentUserData
}) {
  const loadStudentProfile = useCallback(async () => {
    const userData = getCurrentUserData()
    if (!userData) {
      navigate('/login', { replace: true })
      return
    }

    setStudentUid(userData?.uid || null)
    if (userData?.email) setStudentEmail(userData.email)


    const fallbackName = userData?.name?.trim() || userData?.email?.split('@')[0] || 'Student'
    setStudentName(fallbackName)


    if (userData?.uid) {
      try {

        let profile = await getStudentByUid(userData.uid).catch(err => {
          console.warn('Failed to load student profile:', err)
          return null
        })

        if (profile) {
          setStudentProfile(profile)
          setStudentMySQLId(profile.id)
          

          if (profile.name) {
            setStudentName(profile.name)
          }
          if (profile.photo_url || profile.photoURL) {
            const photoUrl = profile.photo_url || profile.photoURL
            setStudentPic(photoUrl)
            setProfilePreview(photoUrl)
          } else {

            setProfilePreview(null)
          }
          if (profile.email) {
            setStudentEmail(profile.email)
          }
          

          updateSessionUserFields({
            name: profile.name,
            email: profile.email,
            photoURL: profile.photo_url || profile.photoURL
          })


          const [enrollmentsData, gradesData, attendanceData, notificationsData, unreadCount] = await Promise.all([
            getEnrollmentsByStudent(profile.id).catch(err => { 
              console.error('❌ Enrollments error:', err)
              return [] 
            }),
            getGradesByStudent(profile.id).catch(err => { console.error('❌ Grades error:', err); return [] }),
            getAttendanceByStudent(profile.id).catch(err => { console.error('❌ Attendance error:', err); return [] }),
            getNotifications({ limit: 50 }).catch(err => { 
              console.error('❌ Notifications error:', err)
              return [] 
            }),
            getUnreadCount().catch(err => { console.error('❌ Unread count error:', err); return 0 })
          ])
          

          let notificationsArray = []
          if (Array.isArray(notificationsData)) {
            notificationsArray = notificationsData
          } else if (notificationsData && typeof notificationsData === 'object') {
            if (Array.isArray(notificationsData.data)) {
              notificationsArray = notificationsData.data
            } else if (Array.isArray(notificationsData.notifications)) {
              notificationsArray = notificationsData.notifications
            }
          }
          
          setEnrollments(enrollmentsData)
          setLiveGrades(gradesData)
          setLiveAttendance(attendanceData)
          const finalNotificationsArray = Array.isArray(notificationsArray) ? notificationsArray : []
          setNotifications(finalNotificationsArray)
          setUnreadNotificationCount(unreadCount)


          const enrollmentsWithCourseData = enrollmentsData.filter(e => e.code && e.course_name)
          const enrollmentsNeedingCourseLoad = enrollmentsData.filter(e => !e.code || !e.course_name)
          

          const coursePromises = enrollmentsNeedingCourseLoad.map(enrollment => {
            return getCourseById(enrollment.course_id).catch((err) => {
              console.error('  ❌ Failed to load course ID:', enrollment.course_id, err)
              return null
            })
          })
          const coursesData = await Promise.all(coursePromises)
          const loadedCourses = coursesData.filter(Boolean)
          

          const coursesFromEnrollments = enrollmentsWithCourseData.map(e => ({
            id: e.course_id,
            code: e.code,
            name: e.course_name,
            credits: e.credits || 0
          }))
          
          const allCourses = [...coursesFromEnrollments, ...loadedCourses]
          const uniqueCourses = Array.from(new Map(allCourses.map(c => [c.id, c])).values())
          
          setCourses(uniqueCourses)


          const transformedData = transformDashboardDataFromMySQL(
            enrollmentsData,
            uniqueCourses,
            gradesData,
            attendanceData,
            profile.name || fallbackName,
            notificationsData
          )
          setData(transformedData)

        } else {
          console.warn('⚠️ Student profile not found in MySQL. Firebase UID:', userData.uid)
          console.warn('💡 Attempting to find or create student profile...')
          

          if (userData?.email) {
            try {
              let studentByEmail = await getStudentByEmail(userData.email)
              
              if (studentByEmail) {

                if ((!studentByEmail.firebase_uid || studentByEmail.firebase_uid.startsWith('temp_')) && userData.uid) {
                  try {
                    sessionStorage.setItem('studentProfileProcessing', 'true')
                    
                    await updateStudent(studentByEmail.id, {
                      firebase_uid: userData.uid,
                      name: studentByEmail.name,
                      email: studentByEmail.email,
                      studentId: studentByEmail.student_id || studentByEmail.studentId,
                    })
                    const updatedProfile = await getStudentByUid(userData.uid)
                    if (updatedProfile) {
                      setStudentProfile(updatedProfile)
                      setStudentMySQLId(updatedProfile.id)
                      sessionStorage.removeItem('studentProfileProcessing')
                      profile = updatedProfile
                    } else {
                      sessionStorage.removeItem('studentProfileProcessing')
                    }
                  } catch (linkError) {
                    console.error('❌ Error linking Firebase UID:', linkError)
                    sessionStorage.removeItem('studentProfileProcessing')
                    profile = studentByEmail
                  }
                } else if (studentByEmail.firebase_uid === userData.uid) {
                  setStudentProfile(studentByEmail)
                  setStudentMySQLId(studentByEmail.id)
                  profile = studentByEmail
                } else if (!studentByEmail.firebase_uid || studentByEmail.firebase_uid.startsWith('temp_')) {
                  setStudentProfile(studentByEmail)
                  setStudentMySQLId(studentByEmail.id)
                  profile = studentByEmail
                }
              } else {

                const emailParts = userData.email.split('@')
                const emailPrefix = emailParts[0]
                const emailParts2 = emailPrefix.split('.')
                let extractedStudentId = null
                if (emailParts2.length >= 2) {
                  for (let i = emailParts2.length - 1; i >= 0; i--) {
                    if (/^\d+$/.test(emailParts2[i])) {
                      extractedStudentId = emailParts2[i]
                      break
                    }
                  }
                }
                
                if (extractedStudentId) {
                  try {
                    const studentByNumericalId = await getStudentByNumericalId(extractedStudentId)
                    if (studentByNumericalId) {
                      sessionStorage.setItem('studentProfileProcessing', 'true')
                      
                      await updateStudent(studentByNumericalId.id, {
                        firebase_uid: userData.uid,
                        name: studentByNumericalId.name,
                        email: userData.email,
                        studentId: studentByNumericalId.student_id,
                      })
                      const updatedProfile = await getStudentByUid(userData.uid)
                      if (updatedProfile) {
                        setStudentProfile(updatedProfile)
                        setStudentMySQLId(updatedProfile.id)
                        sessionStorage.removeItem('studentProfileProcessing')
                        profile = updatedProfile
                      } else {
                        sessionStorage.removeItem('studentProfileProcessing')
                      }
                    } else {

                      sessionStorage.setItem('studentProfileProcessing', 'true')
                      
                      await setStudent(userData.uid, {
                        name: userData.name || emailPrefix.split('.')[0] || 'Student',
                        email: userData.email,
                        studentId: extractedStudentId,
                      })
                      const newProfile = await getStudentByUid(userData.uid)
                      if (newProfile) {
                        setStudentProfile(newProfile)
                        setStudentMySQLId(newProfile.id)
                        sessionStorage.removeItem('studentProfileProcessing')
                        profile = newProfile
                      } else {
                        sessionStorage.removeItem('studentProfileProcessing')
                      }
                    }
                  } catch (err) {
                    console.error('❌ Error finding/creating student by ID:', err)
                  }
                } else {
                  console.warn('⚠️ Could not extract student ID from email. Student may need to be enrolled by professor first.')
                }
              }
            } catch (err) {
              console.error('❌ Error finding/creating student:', err)
            }
          }
          

          if (profile && profile.id) {

            const [enrollmentsData, gradesData, attendanceData, notificationsData, unreadCount] = await Promise.all([
              getEnrollmentsByStudent(profile.id).catch(err => { 
                console.error('❌ Enrollments error:', err)
                return [] 
              }),
              getGradesByStudent(profile.id).catch(err => { console.error('❌ Grades error:', err); return [] }),
              getAttendanceByStudent(profile.id).catch(err => { console.error('❌ Attendance error:', err); return [] }),
              getNotifications({ limit: 50 }).catch(err => { 
                console.error('❌ Notifications error:', err)
                return [] 
              }),
              getUnreadCount().catch(err => { console.error('❌ Unread count error:', err); return 0 })
            ])
            
            setEnrollments(enrollmentsData)
            setLiveGrades(gradesData)
            setLiveAttendance(attendanceData)
            
            const normalizedNotifications = Array.isArray(notificationsData) ? notificationsData : []
            const finalNotificationsArray = Array.isArray(normalizedNotifications) ? normalizedNotifications : []
            setNotifications(finalNotificationsArray)
            setUnreadNotificationCount(unreadCount)


            const enrollmentsWithCourseData = enrollmentsData.filter(e => e.code && e.course_name)
            const enrollmentsNeedingCourseLoad = enrollmentsData.filter(e => !e.code || !e.course_name)
            
            const coursePromises = enrollmentsNeedingCourseLoad.map(enrollment => {
              return getCourseById(enrollment.course_id).catch((err) => {
                console.error('  ❌ Failed to load course ID:', enrollment.course_id, err)
                return null
              })
            })
            const coursesData = await Promise.all(coursePromises)
            const loadedCourses = coursesData.filter(Boolean)
            
            const coursesFromEnrollments = enrollmentsWithCourseData.map(e => ({
              id: e.course_id,
              code: e.code,
              name: e.course_name,
              credits: e.credits || 0,
              term: e.term || 'first'
            }))
            
            const allCourses = [...coursesFromEnrollments, ...loadedCourses]
            const uniqueCourses = Array.from(new Map(allCourses.map(c => [c.id, c])).values())
            
            setCourses(uniqueCourses)


            const transformedData = transformDashboardDataFromMySQL(
              enrollmentsData,
              uniqueCourses,
              gradesData,
              attendanceData,
              profile.name || fallbackName,
              notificationsData || []
            )
            setData(transformedData)

          } else if (!profile) {
            console.error('❌ Could not load or create student profile')
            console.warn('💡 Student may need to be enrolled by professor first, or their Firebase UID may not be linked to their MySQL record.')
          }
        }
      } catch (error) {
        console.error('Error loading student data:', error)
        sessionStorage.removeItem('studentProfileProcessing')
      }
    }
  }, [
    navigate,
    setStudentUid,
    setStudentEmail,
    setStudentName,
    setStudentProfile,
    setStudentMySQLId,
    setStudentPic,
    setProfilePreview,
    setEnrollments,
    setLiveGrades,
    setLiveAttendance,
    setNotifications,
    setUnreadNotificationCount,
    setCourses,
    setData,
    getCurrentUserData
  ])

  return {
    loadStudentProfile
  }
}

