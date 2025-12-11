import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Student.css'
import { getStudentByUid, setStudent, updateStudent, getStudentByEmail, getStudentByNumericalId } from '../../services/students'
import { getEnrollmentsByStudent, subscribeToStudentEnrollments } from '../../services/enrollments'
import { getGradesByStudent, subscribeToStudentGrades } from '../../services/grades'
import { getAttendanceByStudent, subscribeToStudentAttendance } from '../../services/attendance'
import { getNotifications, subscribeToNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notifications'
import { getCourseById } from '../../services/courses'
import { useTheme } from '../../hooks/useTheme'

// Import the original Student.js data and functions
// For now, we'll recreate the essential functionality

const defaultData = {
  id: "default",
  name: "Student",
  abs: 0,
  examTaken: 0,
  examTotal: 0,
  attRate: 0,
  avgGrade: 0,
  firstTerm: [], // Empty array - will be populated from Firestore when student is enrolled
  secondTerm: [],
  notifs: []
}

function Student() {
  const navigate = useNavigate()
  const [data, setData] = useState(defaultData)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentSort, setCurrentSort] = useState('none')
  const [showModal, setShowModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [studentName, setStudentName] = useState('Student')
  const [studentPic, setStudentPic] = useState('/assets/images/trisha.jpg')
  const [studentUid, setStudentUid] = useState(null)
  const [studentEmail, setStudentEmail] = useState('')
  const [studentProfile, setStudentProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({ name: '', pic: null })
  const [profilePreview, setProfilePreview] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)
  const [profileSaveError, setProfileSaveError] = useState('')
  const [profileSection, setProfileSection] = useState('account') // 'account', 'appearance'
  const realtimeUnsubscribeRef = useRef(null)
  const previousDataRef = useRef(null)
  
  // Data from MySQL API
  const [studentMySQLId, setStudentMySQLId] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [liveGrades, setLiveGrades] = useState([])
  const [liveAttendance, setLiveAttendance] = useState([])
  const gradesUnsubscribeRef = useRef(null)
  const attendanceUnsubscribeRef = useRef(null)
  const enrollmentsUnsubscribeRef = useRef(null)
  const notificationsUnsubscribeRef = useRef(null)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

  // System-wide theme management
  const { isDarkMode, toggleTheme } = useTheme()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    // Prevent infinite reloads - check if we're already processing
    const isProcessing = sessionStorage.getItem('studentProfileProcessing')
    if (isProcessing === 'true') {
      console.log('⏸️ Profile processing already in progress, skipping...')
      return
    }

    const loadStudentProfile = async () => {
      const currentUser = sessionStorage.getItem('currentUser')
      if (!currentUser) {
        navigate('/login')
        return
      }

      let userData = null
      try {
        userData = JSON.parse(currentUser)
      } catch (err) {
        console.warn('Failed to parse current user from session', err)
      }

      setStudentUid(userData?.uid || null)
      if (userData?.email) setStudentEmail(userData.email)

      // Use sessionStorage data immediately for instant UI display (optimistic)
      const fallbackName = userData?.name?.trim() || userData?.email?.split('@')[0] || 'Student'
      setStudentName(fallbackName)

      // Load profile and all academic data from MySQL API
      if (userData?.uid) {
        try {
          // Get student profile (contains MySQL ID)
          let profile = await getStudentByUid(userData.uid).catch(err => {
            console.warn('Failed to load student profile:', err)
            return null
          })

          if (profile) {
            setStudentProfile(profile)
            setStudentMySQLId(profile.id) // Store MySQL ID
            
            console.log('✅ Student profile found in MySQL:', {
              mysqlId: profile.id,
              firebaseUid: userData.uid,
              studentId: profile.student_id,
              name: profile.name,
              email: profile.email
            })
            
            // Use exact name from profile
            if (profile.name) {
              setStudentName(profile.name)
            }
            if (profile.photo_url || profile.photoURL) {
              const photoUrl = profile.photo_url || profile.photoURL
              setStudentPic(photoUrl)
              setProfilePreview(photoUrl)
            } else {
              // No photo - reset preview
              setProfilePreview(null)
            }
            if (profile.email) {
              setStudentEmail(profile.email)
            }
            
            // Update session storage with loaded profile data (ensures persistence after refresh)
            const currentUser = sessionStorage.getItem('currentUser')
            if (currentUser) {
              try {
                const userData = JSON.parse(currentUser)
                userData.name = profile.name || userData.name
                userData.email = profile.email || userData.email
                if (profile.photo_url || profile.photoURL) {
                  userData.photoURL = profile.photo_url || profile.photoURL
                }
                sessionStorage.setItem('currentUser', JSON.stringify(userData))
              } catch (err) {
                console.warn('Failed to update session storage', err)
              }
            }

            // Load all academic data in parallel
            console.log('📚 Loading student data for MySQL ID:', profile.id, '(type:', typeof profile.id, ')')
            const [enrollmentsData, gradesData, attendanceData, notificationsData, unreadCount] = await Promise.all([
              getEnrollmentsByStudent(profile.id).catch(err => { 
                console.error('❌ Enrollments error:', err)
                console.error('❌ Enrollment error details:', {
                  studentMySQLId: profile.id,
                  errorMessage: err.message,
                  errorStack: err.stack
                })
                return [] 
              }),
              getGradesByStudent(profile.id).catch(err => { console.error('❌ Grades error:', err); return [] }),
              getAttendanceByStudent(profile.id).catch(err => { console.error('❌ Attendance error:', err); return [] }),
              getNotifications({ limit: 50 }).catch(err => { console.error('❌ Notifications error:', err); return [] }),
              getUnreadCount().catch(err => { console.error('❌ Unread count error:', err); return 0 })
            ])
            
            console.log('📊 Loaded data:', {
              enrollments: enrollmentsData.length,
              grades: gradesData.length,
              attendance: attendanceData.length,
              notifications: notificationsData.length
            })
            console.log('📊 Enrollments details:', enrollmentsData)
            console.log('📊 Enrollment course IDs:', enrollmentsData.map(e => e.course_id))

            setEnrollments(enrollmentsData)
            setLiveGrades(gradesData)
            setLiveAttendance(attendanceData)
            setNotifications(notificationsData)
            setUnreadNotificationCount(unreadCount)

            // Load course details for enrollments
            console.log('📚 Loading course details for', enrollmentsData.length, 'enrollments...')
            const coursePromises = enrollmentsData.map(enrollment => {
              console.log('  → Loading course ID:', enrollment.course_id)
              return getCourseById(enrollment.course_id).catch((err) => {
                console.error('  ❌ Failed to load course ID:', enrollment.course_id, err)
                return null
              })
            })
            const coursesData = await Promise.all(coursePromises)
            const validCourses = coursesData.filter(Boolean)
            console.log('📚 Loaded', validCourses.length, 'courses:', validCourses.map(c => ({ id: c.id, code: c.code, name: c.name })))
            setCourses(validCourses)

            // Transform data for UI
            const transformedData = transformDashboardDataFromMySQL(
              enrollmentsData,
              validCourses,
              gradesData,
              attendanceData,
              profile.name || fallbackName
            )
            setData(transformedData)

            console.log('✅ Student dashboard data loaded from MySQL:', {
              enrollments: enrollmentsData.length,
              courses: validCourses.length,
              grades: gradesData.length,
              attendance: attendanceData.length,
              notifications: notificationsData.length,
              unreadCount,
              firstTermSubjects: transformedData.firstTerm?.length || 0,
              secondTermSubjects: transformedData.secondTerm?.length || 0
            })
          } else {
            console.warn('⚠️ Student profile not found in MySQL. Firebase UID:', userData.uid)
            console.warn('💡 Attempting to find or create student profile...')
            
            // Try to find student by email as fallback
            if (userData?.email) {
              console.log('🔍 Trying to find student by email:', userData.email)
              try {
                let studentByEmail = await getStudentByEmail(userData.email)
                
                if (studentByEmail) {
                  console.log('✅ Found student by email:', {
                    mysqlId: studentByEmail.id,
                    firebaseUid: studentByEmail.firebase_uid,
                    studentId: studentByEmail.student_id,
                    name: studentByEmail.name
                  })
                  
                  // Update their Firebase UID if missing or if it's a temp UID
                  if ((!studentByEmail.firebase_uid || studentByEmail.firebase_uid.startsWith('temp_')) && userData.uid) {
                    console.log('🔗 Linking Firebase UID to student MySQL record...')
                    try {
                      // Mark as processing to prevent reload loop
                      sessionStorage.setItem('studentProfileProcessing', 'true')
                      
                      await updateStudent(studentByEmail.id, {
                        firebase_uid: userData.uid,
                        name: studentByEmail.name,
                        email: studentByEmail.email,
                        studentId: studentByEmail.student_id || studentByEmail.studentId,
                      })
                      // Reload profile
                      const updatedProfile = await getStudentByUid(userData.uid)
                      if (updatedProfile) {
                        console.log('✅ Successfully linked Firebase UID to MySQL record')
                        setStudentProfile(updatedProfile)
                        setStudentMySQLId(updatedProfile.id)
                        // Clear processing flag
                        sessionStorage.removeItem('studentProfileProcessing')
                        // Continue loading data instead of reloading
                        profile = updatedProfile
                        // Don't return - continue with data loading below
                      } else {
                        sessionStorage.removeItem('studentProfileProcessing')
                      }
                    } catch (linkError) {
                      console.error('❌ Error linking Firebase UID:', linkError)
                      sessionStorage.removeItem('studentProfileProcessing')
                      // Continue anyway with the student data we found
                      profile = studentByEmail
                    }
                  } else if (studentByEmail.firebase_uid === userData.uid) {
                    // Firebase UID matches, but getStudentByUid didn't find it - use the student we found
                    console.log('🔄 Firebase UID matches, using student found by email')
                    setStudentProfile(studentByEmail)
                    setStudentMySQLId(studentByEmail.id)
                    // Continue with data loading below
                    profile = studentByEmail
                  } else if (!studentByEmail.firebase_uid || studentByEmail.firebase_uid.startsWith('temp_')) {
                    // Student exists but Firebase UID not properly linked - use the student we found anyway
                    console.log('⚠️ Student found but Firebase UID not linked, using student data anyway')
                    setStudentProfile(studentByEmail)
                    setStudentMySQLId(studentByEmail.id)
                    profile = studentByEmail
                  }
                } else {
                  // Student doesn't exist in MySQL by email - try to find by extracted student ID from email
                  console.log('📝 Student not found in MySQL by email, trying to find by student ID from email...')
                  const emailParts = userData.email.split('@')
                  const emailPrefix = emailParts[0]
                  // Try to extract student ID from email (format: name.studentid.tc@umindanao.edu.ph)
                  const emailParts2 = emailPrefix.split('.')
                  let extractedStudentId = null
                  if (emailParts2.length >= 2) {
                    // Try to find a numeric part that looks like a student ID
                    for (let i = emailParts2.length - 1; i >= 0; i--) {
                      if (/^\d+$/.test(emailParts2[i])) {
                        extractedStudentId = emailParts2[i]
                        break
                      }
                    }
                  }
                  
                  if (extractedStudentId) {
                    console.log('🔍 Trying to find student by extracted ID:', extractedStudentId)
                    try {
                      // Try to find student by numerical ID - they might have been enrolled already
                      const studentByNumericalId = await getStudentByNumericalId(extractedStudentId)
                      if (studentByNumericalId) {
                        console.log('✅ Found student by numerical ID! Linking Firebase UID...', {
                          mysqlId: studentByNumericalId.id,
                          studentId: studentByNumericalId.student_id,
                          currentFirebaseUid: studentByNumericalId.firebase_uid
                        })
                        // Link Firebase UID to this existing MySQL record
                        // Use updateStudent directly with MySQL ID to update firebase_uid
                        // Mark as processing to prevent reload loop
                        sessionStorage.setItem('studentProfileProcessing', 'true')
                        
                        await updateStudent(studentByNumericalId.id, {
                          firebase_uid: userData.uid,
                          name: studentByNumericalId.name,
                          email: userData.email, // Use the email from login (might be more current)
                          studentId: studentByNumericalId.student_id,
                        })
                        // Reload profile
                        const updatedProfile = await getStudentByUid(userData.uid)
                        if (updatedProfile) {
                          console.log('✅ Successfully linked Firebase UID to existing MySQL record')
                          setStudentProfile(updatedProfile)
                          setStudentMySQLId(updatedProfile.id)
                          // Clear processing flag
                          sessionStorage.removeItem('studentProfileProcessing')
                          // Continue loading data instead of reloading
                          profile = updatedProfile
                          // Don't return - continue with data loading below
                        } else {
                          sessionStorage.removeItem('studentProfileProcessing')
                        }
                      } else {
                        // Student doesn't exist - create them
                        console.log('📝 Student not found by ID either, creating new profile...')
                        // Mark as processing to prevent reload loop
                        sessionStorage.setItem('studentProfileProcessing', 'true')
                        
                        await setStudent(userData.uid, {
                          name: userData.name || emailPrefix.split('.')[0] || 'Student',
                          email: userData.email,
                          studentId: extractedStudentId,
                        })
                        // Reload profile
                        const newProfile = await getStudentByUid(userData.uid)
                        if (newProfile) {
                          console.log('✅ Created new student profile in MySQL')
                          setStudentProfile(newProfile)
                          setStudentMySQLId(newProfile.id)
                          // Clear processing flag
                          sessionStorage.removeItem('studentProfileProcessing')
                          // Continue loading data instead of reloading
                          profile = newProfile
                          // Don't return - continue with data loading below
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
            
            // If we have a profile (from fallback logic), load data for it
            if (profile && profile.id) {
              console.log('📚 Loading data for profile found via fallback logic...')
              
              // Load all academic data in parallel
              console.log('📚 Loading student data for MySQL ID:', profile.id, '(type:', typeof profile.id, ')')
              const [enrollmentsData, gradesData, attendanceData, notificationsData, unreadCount] = await Promise.all([
                getEnrollmentsByStudent(profile.id).catch(err => { 
                  console.error('❌ Enrollments error:', err)
                  console.error('❌ Enrollment error details:', {
                    studentMySQLId: profile.id,
                    errorMessage: err.message,
                    errorStack: err.stack
                  })
                  return [] 
                }),
                getGradesByStudent(profile.id).catch(err => { console.error('❌ Grades error:', err); return [] }),
                getAttendanceByStudent(profile.id).catch(err => { console.error('❌ Attendance error:', err); return [] }),
                getNotifications({ limit: 50 }).catch(err => { console.error('❌ Notifications error:', err); return [] }),
                getUnreadCount().catch(err => { console.error('❌ Unread count error:', err); return 0 })
              ])
              
              console.log('📊 Loaded data:', {
                enrollments: enrollmentsData.length,
                grades: gradesData.length,
                attendance: attendanceData.length,
                notifications: notificationsData.length
              })
              console.log('📊 Enrollments details:', enrollmentsData)
              console.log('📊 Enrollment course IDs:', enrollmentsData.map(e => e.course_id))

              setEnrollments(enrollmentsData)
              setLiveGrades(gradesData)
              setLiveAttendance(attendanceData)
              setNotifications(notificationsData)
              setUnreadNotificationCount(unreadCount)

              // Load course details for enrollments
              console.log('📚 Loading course details for', enrollmentsData.length, 'enrollments...')
              const coursePromises = enrollmentsData.map(enrollment => {
                console.log('  → Loading course ID:', enrollment.course_id)
                return getCourseById(enrollment.course_id).catch((err) => {
                  console.error('  ❌ Failed to load course ID:', enrollment.course_id, err)
                  return null
                })
              })
              const coursesData = await Promise.all(coursePromises)
              const validCourses = coursesData.filter(Boolean)
              console.log('📚 Loaded', validCourses.length, 'courses:', validCourses.map(c => ({ id: c.id, code: c.code, name: c.name })))
              setCourses(validCourses)

              // Transform data for UI
              const transformedData = transformDashboardDataFromMySQL(
                enrollmentsData,
                validCourses,
                gradesData,
                attendanceData,
                profile.name || fallbackName
              )
              setData(transformedData)

              console.log('✅ Student dashboard data loaded from MySQL:', {
                enrollments: enrollmentsData.length,
                courses: validCourses.length,
                grades: gradesData.length,
                attendance: attendanceData.length,
                notifications: notificationsData.length,
                unreadCount,
                firstTermSubjects: transformedData.firstTerm?.length || 0,
                secondTermSubjects: transformedData.secondTerm?.length || 0
              })
            } else if (!profile) {
              // If we still don't have a profile, show a message
              console.error('❌ Could not load or create student profile')
              console.warn('💡 Student may need to be enrolled by professor first, or their Firebase UID may not be linked to their MySQL record.')
            }
          }
        } catch (error) {
          console.error('Error loading student data:', error)
          // Clear processing flag on error
          sessionStorage.removeItem('studentProfileProcessing')
        }
      }
    }

    loadStudentProfile()
    
    // Cleanup function
    return () => {
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current()
        realtimeUnsubscribeRef.current = null
      }
      if (gradesUnsubscribeRef.current) {
        gradesUnsubscribeRef.current()
        gradesUnsubscribeRef.current = null
      }
      if (attendanceUnsubscribeRef.current) {
        attendanceUnsubscribeRef.current()
        attendanceUnsubscribeRef.current = null
      }
    }
  }, [navigate])

  // Refs to store latest values for use in callbacks
  const enrollmentsRef = useRef(enrollments)
  const coursesRef = useRef(courses)
  const liveGradesRef = useRef(liveGrades)
  const liveAttendanceRef = useRef(liveAttendance)
  const studentNameRef = useRef(studentName)

  // Update refs when state changes
  useEffect(() => {
    enrollmentsRef.current = enrollments
  }, [enrollments])
  useEffect(() => {
    coursesRef.current = courses
  }, [courses])
  useEffect(() => {
    liveGradesRef.current = liveGrades
  }, [liveGrades])
  useEffect(() => {
    liveAttendanceRef.current = liveAttendance
  }, [liveAttendance])
  useEffect(() => {
    studentNameRef.current = studentName
  }, [studentName])

  // Set up polling for grades, attendance, enrollments, and notifications
  useEffect(() => {
    if (!studentMySQLId) return

    console.log('Setting up polling for student MySQL ID:', studentMySQLId)

    // Helper function to recalculate data using refs
    const recalculateData = () => {
      const currentEnrollments = enrollmentsRef.current
      const currentCourses = coursesRef.current
      const currentLiveGrades = liveGradesRef.current
      const currentLiveAttendance = liveAttendanceRef.current
      const currentStudentName = studentNameRef.current

      if (currentEnrollments.length > 0 && currentCourses.length > 0) {
        const transformedData = transformDashboardDataFromMySQL(
          currentEnrollments,
          currentCourses,
          currentLiveGrades,
          currentLiveAttendance,
          currentStudentName
        )
        setData(transformedData)
      }
    }

    // Poll for grades (updates when professor inputs grades)
    const gradesUnsubscribe = subscribeToStudentGrades(studentMySQLId, (grades) => {
      console.log('📊 Grades polled for student MySQL ID:', studentMySQLId)
      console.log('📊 Grades received:', grades.length, 'grades')
      setLiveGrades(grades)
      // Recalculate dashboard data after state update
      setTimeout(recalculateData, 0)
    })

    // Poll for attendance (updates when professor marks attendance)
    const attendanceUnsubscribe = subscribeToStudentAttendance(studentMySQLId, (attendance) => {
      console.log('📊 Attendance updated:', attendance.length, 'records')
      setLiveAttendance(attendance)
      // Recalculate dashboard data after state update
      setTimeout(recalculateData, 0)
    })

    // Poll for enrollments (updates when professor enrolls student)
    const enrollmentsUnsubscribe = subscribeToStudentEnrollments(studentMySQLId, async (enrollmentsData) => {
      console.log('📚 Enrollments updated:', enrollmentsData.length, 'enrollments')
      setEnrollments(enrollmentsData)
      
      // Load course details for new enrollments
      const coursePromises = enrollmentsData.map(enrollment => 
        getCourseById(enrollment.course_id).catch(() => null)
      )
      const coursesData = await Promise.all(coursePromises)
      const validCourses = coursesData.filter(Boolean)
      setCourses(validCourses)

      // Recalculate dashboard data after state updates
      setTimeout(() => {
        const transformedData = transformDashboardDataFromMySQL(
          enrollmentsData,
          validCourses,
          liveGradesRef.current,
          liveAttendanceRef.current,
          studentNameRef.current
        )
        setData(transformedData)
      }, 0)
    })

    // Poll for notifications
    const notificationsUnsubscribe = subscribeToNotifications((notificationsData) => {
      console.log('Notifications updated:', notificationsData.length, 'notifications')
      setNotifications(notificationsData)
      // Update unread count
      const unread = notificationsData.filter(n => !n.read).length
      setUnreadNotificationCount(unread)
    }, { limit: 50 })

    // Poll for unread count
    const unreadCountInterval = setInterval(async () => {
      try {
        const count = await getUnreadCount()
        setUnreadNotificationCount(count)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }, 5000)

    gradesUnsubscribeRef.current = gradesUnsubscribe
    attendanceUnsubscribeRef.current = attendanceUnsubscribe
    enrollmentsUnsubscribeRef.current = enrollmentsUnsubscribe
    notificationsUnsubscribeRef.current = notificationsUnsubscribe

    // Cleanup
    return () => {
      if (gradesUnsubscribeRef.current) {
        gradesUnsubscribeRef.current()
        gradesUnsubscribeRef.current = null
      }
      if (attendanceUnsubscribeRef.current) {
        attendanceUnsubscribeRef.current()
        attendanceUnsubscribeRef.current = null
      }
      if (enrollmentsUnsubscribeRef.current) {
        enrollmentsUnsubscribeRef.current()
        enrollmentsUnsubscribeRef.current = null
      }
      if (notificationsUnsubscribeRef.current) {
        notificationsUnsubscribeRef.current()
        notificationsUnsubscribeRef.current = null
      }
      if (unreadCountInterval) {
        clearInterval(unreadCountInterval)
      }
    }
  }, [studentMySQLId]) // Only depend on studentMySQLId to prevent infinite loops

  // Transform MySQL data to UI format
  const transformDashboardDataFromMySQL = (enrollmentsData, coursesData, gradesData, attendanceData, studentName) => {
    // Create a map of course_id to course for quick lookup
    const courseMap = new Map()
    coursesData.forEach(course => {
      courseMap.set(course.id, course)
    })

    // Create a map of course_id to enrollment
    const enrollmentMap = new Map()
    enrollmentsData.forEach(enrollment => {
      enrollmentMap.set(enrollment.course_id, enrollment)
    })

    // Group grades by course
    const gradesByCourse = new Map()
    gradesData.forEach(grade => {
      if (!gradesByCourse.has(grade.course_id)) {
        gradesByCourse.set(grade.course_id, [])
      }
      gradesByCourse.get(grade.course_id).push(grade)
    })

    // Group attendance by course
    const attendanceByCourse = new Map()
    attendanceData.forEach(att => {
      if (!attendanceByCourse.has(att.course_id)) {
        attendanceByCourse.set(att.course_id, [])
      }
      attendanceByCourse.get(att.course_id).push(att)
    })

    // Calculate overall statistics
    let totalAbsences = 0
    let totalExams = 0
    let examsTaken = 0
    let totalScore = 0
    let totalMax = 0
    let totalPresent = 0
    let totalSessions = 0

    // Transform enrollments to subjects
    console.log('🔄 Transforming enrollments to subjects:', {
      enrollmentsCount: enrollmentsData.length,
      coursesCount: coursesData.length,
      courseMapSize: courseMap.size,
      enrollmentCourseIds: enrollmentsData.map(e => e.course_id),
      availableCourseIds: Array.from(courseMap.keys())
    })
    
    const firstTerm = enrollmentsData.map(enrollment => {
      const course = courseMap.get(enrollment.course_id)
      if (!course) {
        console.warn('⚠️ Course not found for enrollment:', {
          enrollmentId: enrollment.id,
          courseId: enrollment.course_id,
          availableCourseIds: Array.from(courseMap.keys())
        })
        return null
      }
      
      console.log('✅ Processing enrollment:', {
        enrollmentId: enrollment.id,
        courseId: enrollment.course_id,
        courseCode: course.code,
        courseName: course.name
      })

      const courseGrades = gradesByCourse.get(course.id) || []
      const courseAttendance = attendanceByCourse.get(course.id) || []

      // Process grades
      const subjectExams = []
      let subjectScore = 0
      let subjectMax = 0

      courseGrades.forEach(grade => {
        subjectExams.push({
          name: grade.assessment_title,
          type: (grade.assessment_type || 'Assessment').charAt(0).toUpperCase() + (grade.assessment_type || 'Assessment').slice(1),
          status: 'Taken',
          score: grade.score,
          maxPoints: grade.max_points,
          date: grade.date || grade.created_at || null,
        })
        subjectScore += grade.score
        subjectMax += grade.max_points
        totalExams++
        examsTaken++
        totalScore += grade.score
        totalMax += grade.max_points
      })

      // Process attendance
      let subjectPresent = 0
      let subjectAbsent = 0
      const subjectAttendanceRecords = []

      courseAttendance.forEach(att => {
        subjectAttendanceRecords.push({
          date: att.date,
          status: att.status,
          createdAt: att.created_at,
          updatedAt: att.updated_at,
        })
        if (att.status === 'present') {
          subjectPresent++
          totalPresent++
          totalSessions++
        } else if (att.status === 'absent') {
          subjectAbsent++
          totalAbsences++
          totalSessions++
        } else {
          totalSessions++
        }
      })

      const subjectGrade = subjectMax > 0 ? Math.round((subjectScore / subjectMax) * 100) : 0
      const subjectAttRate = (subjectPresent + subjectAbsent) > 0
        ? Math.round((subjectPresent / (subjectPresent + subjectAbsent)) * 100)
        : 0

      return {
        id: course.code.split(' ')[0] || course.code,
        code: course.code,
        name: course.name || course.code,
        grade: subjectGrade,
        attRate: subjectAttRate,
        present: subjectPresent,
        abs: subjectAbsent,
        exams: subjectExams.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
        attendanceRecords: subjectAttendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date)),
        instructor: {
          name: 'TBA',
          email: '',
          schedule: 'TBA',
        },
      }
    }).filter(Boolean)

    console.log('✅ Transform complete:', {
      firstTermSubjects: firstTerm.length,
      totalAbsences,
      examsTaken,
      totalExams,
      avgGrade: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0,
      attRate: totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0
    })

    const avgGrade = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
    const attRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0

    const result = {
      id: "student",
      name: studentName,
      abs: totalAbsences,
      examTaken: examsTaken,
      examTotal: totalExams,
      attRate: attRate,
      avgGrade: avgGrade,
      firstTerm: Array.isArray(firstTerm) ? firstTerm : [],
      secondTerm: [],
      notifs: notifications,
    }
    
    console.log('📊 Final transformed data:', {
      firstTermCount: result.firstTerm.length,
      firstTermSubjects: result.firstTerm.map(s => ({ code: s.code, name: s.name }))
    })
    
    return result
  }

  const calculateDashboardStatisticsFallback = () => {
    let absences = 0
    let examsCompleted = 0
    let totalExams = 0
    let attendancePresent = 0
    let attendanceSessions = 0
    let totalScore = 0
    let totalMaxPoints = 0

    const allSubjects = [
      ...(Array.isArray(data.firstTerm) ? data.firstTerm : []),
      ...(Array.isArray(data.secondTerm) ? data.secondTerm : []),
    ]

    allSubjects.forEach(subject => {
      // Attendance records
      const attendanceRecords = subject.attendanceRecords || []
      attendanceRecords.forEach(record => {
        if (!record?.status) return
        attendanceSessions++
        if (record.status === 'present') {
          attendancePresent++
        } else if (record.status === 'absent') {
          absences++
        }
      })

      // Exams / grades
      const exams = subject.exams || []
      exams.forEach(exam => {
        totalExams++
        if (exam.status === 'Taken' && exam.score !== undefined && exam.maxPoints !== undefined) {
          examsCompleted++
          totalScore += exam.score || 0
          totalMaxPoints += exam.maxPoints || 0
        }
      })
    })

    const attendanceRate = attendanceSessions > 0
      ? Math.round((attendancePresent / attendanceSessions) * 100)
      : 0

    const averageGrade = totalMaxPoints > 0
      ? Math.round((totalScore / totalMaxPoints) * 100)
      : 0

    return {
      absences,
      examsCompleted,
      totalExams,
      attendanceRate,
      averageGrade,
    }
  }

  // Calculate real-time statistics from MySQL data
  const calculateRealTimeStatistics = () => {
    // Calculate stats from MySQL data (liveGrades and liveAttendance)
    const liveAbsences = liveAttendance.filter(record => record.status === 'absent').length
    
    const gradesWithScores = liveGrades.filter(grade => 
      grade.score !== undefined && grade.score !== null && grade.max_points !== undefined
    )
    const liveExamsCompleted = gradesWithScores.length
    const liveTotalExams = liveGrades.length
    
    const livePresentCount = liveAttendance.filter(record => record.status === 'present').length
    const liveTotalSessions = liveAttendance.length
    const liveAttendanceRate = liveTotalSessions > 0 
      ? Math.round((livePresentCount / liveTotalSessions) * 100) 
      : 0
    
    let liveTotalScore = 0
    let liveTotalMaxPoints = 0
    gradesWithScores.forEach(grade => {
      liveTotalScore += parseFloat(grade.score) || 0
      liveTotalMaxPoints += parseFloat(grade.max_points) || 0
    })
    const liveAverageGrade = liveTotalMaxPoints > 0 
      ? Math.round((liveTotalScore / liveTotalMaxPoints) * 100) 
      : 0

    const fallbackStats = calculateDashboardStatisticsFallback()

    const hasLiveAttendance = liveAttendance.length > 0
    const hasLiveGrades = liveGrades.length > 0

    return {
      absences: hasLiveAttendance ? liveAbsences : fallbackStats.absences,
      examsCompleted: hasLiveGrades ? liveExamsCompleted : fallbackStats.examsCompleted,
      totalExams: hasLiveGrades ? liveTotalExams : fallbackStats.totalExams,
      attendanceRate: hasLiveAttendance ? liveAttendanceRate : fallbackStats.attendanceRate,
      averageGrade: hasLiveGrades ? liveAverageGrade : fallbackStats.averageGrade,
    }
  }

  const transformDashboardData = (dashboard, studentName) => {
    const subjects = dashboard.subjects || []
    const grades = dashboard.grades || {}
    const attendance = dashboard.attendance || {}
    
    // Calculate stats
    let totalAbsences = 0
    let totalExams = 0
    let examsTaken = 0
    let totalScore = 0
    let totalMax = 0
    let totalPresent = 0
    let totalSessions = 0
    
    // Transform subjects with grades and attendance
    const firstTerm = subjects.map(subject => {
      const subjectGrades = grades[subject.code] || {}
      const subjectExams = []
      let subjectScore = 0
      let subjectMax = 0
      
      // Process all assessment types
      Object.entries(subjectGrades).forEach(([type, assessments]) => {
        assessments.forEach(assessment => {
          if (assessment.score !== undefined) {
            subjectExams.push({
              name: assessment.title,
              type: type.charAt(0).toUpperCase() + type.slice(1),
              status: 'Taken',
              score: assessment.score,
              maxPoints: assessment.maxPoints,
              date: assessment.date || assessment.createdAt || null,
            })
            subjectScore += assessment.score
            subjectMax += assessment.maxPoints
            totalExams++
            examsTaken++
            totalScore += assessment.score
            totalMax += assessment.maxPoints
          } else {
            subjectExams.push({
              name: assessment.title,
              type: type.charAt(0).toUpperCase() + type.slice(1),
              status: 'Not Taken',
              date: assessment.date || assessment.dueDate || null,
            })
            totalExams++
          }
        })
      })
      
      // Add real-time grades from Firestore for this subject
      // Note: We'll match by courseId when available, but for now include all and let UI handle
      // In a full implementation, we'd need to fetch courses to map courseId to subject code
      const subjectLiveGrades = liveGrades.filter(grade => {
        // If grade has courseId, we'd match it to subject's courseId
        // For now, we'll include grades that might belong to this subject
        // This is a limitation that can be improved with proper courseId mapping
        return true
      })
      
      // Merge live grades into subject exams (prioritize dates from Firestore)
      subjectLiveGrades.forEach(grade => {
        const existingExam = subjectExams.find(exam => 
          exam.name === grade.assessmentTitle && 
          (exam.type.toLowerCase() === (grade.assessmentType || '').toLowerCase())
        )
        if (!existingExam && grade.score !== undefined) {
          // Format date properly
          let formattedDate = null
          if (grade.date) {
            formattedDate = grade.date
          } else if (grade.createdAt) {
            formattedDate = grade.createdAt
          } else if (grade.updatedAt) {
            formattedDate = grade.updatedAt
          }
          
          subjectExams.push({
            name: grade.assessmentTitle || 'Assessment',
            type: grade.assessmentType ? grade.assessmentType.charAt(0).toUpperCase() + grade.assessmentType.slice(1) : 'Exam',
            status: 'Taken',
            score: grade.score,
            maxPoints: grade.maxPoints || 100,
            date: formattedDate,
          })
        } else if (existingExam) {
          // Update date if not already set or if Firestore has a more recent date
          const firestoreDate = grade.date || grade.createdAt || grade.updatedAt
          if (firestoreDate && (!existingExam.date || new Date(firestoreDate) > new Date(existingExam.date || 0))) {
            existingExam.date = firestoreDate
          }
        }
      })
      
      // Calculate attendance for this subject
      let subjectPresent = 0
      let subjectAbsent = 0
      const subjectAttendanceRecords = []
      
      Object.entries(attendance).forEach(([date, dateAttendance]) => {
        const status = dateAttendance[subject.code]
        if (status) {
          subjectAttendanceRecords.push({
            date: date,
            status: status,
          })
        if (status === 'present') {
          subjectPresent++
          totalPresent++
          totalSessions++
        } else if (status === 'absent') {
          subjectAbsent++
          totalAbsences++
          totalSessions++
          }
        }
      })
      
      // Add real-time attendance from Firestore for this subject
      // Note: Similar to grades, we'd match by courseId in a full implementation
      const subjectLiveAttendance = liveAttendance.filter(att => {
        // For now, include all attendance records
        // In full implementation, match att.courseId to subject's courseId
        return true
      })
      
      subjectLiveAttendance.forEach(att => {
        const existingRecord = subjectAttendanceRecords.find(rec => rec.date === att.date)
        if (!existingRecord && att.date) {
          subjectAttendanceRecords.push({
            date: att.date,
            status: att.status,
            createdAt: att.createdAt,
            updatedAt: att.updatedAt,
          })
          if (att.status === 'present') {
            subjectPresent++
            totalPresent++
            totalSessions++
          } else if (att.status === 'absent') {
            subjectAbsent++
            totalAbsences++
            totalSessions++
          }
        } else if (existingRecord) {
          // Update with Firestore metadata if available
          if (att.createdAt) existingRecord.createdAt = att.createdAt
          if (att.updatedAt) existingRecord.updatedAt = att.updatedAt
        }
      })
      
      const subjectGrade = subjectMax > 0 ? Math.round((subjectScore / subjectMax) * 100) : 0
      const subjectAttRate = (subjectPresent + subjectAbsent) > 0 
        ? Math.round((subjectPresent / (subjectPresent + subjectAbsent)) * 100) 
        : 0
      
      return {
        id: subject.code.split(' ')[0] || subject.code,
        code: subject.code,
        name: subject.name || subject.code,
        grade: subjectGrade,
        attRate: subjectAttRate,
        present: subjectPresent,
        abs: subjectAbsent,
        exams: subjectExams,
        attendanceRecords: subjectAttendanceRecords.sort((a, b) => {
          // Sort by date, most recent first
          return new Date(b.date) - new Date(a.date)
        }),
        instructor: subject.instructor || {
          name: 'TBA',
          email: '',
          schedule: 'TBA',
        },
      }
    })
    
    const avgGrade = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
    const attRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0
    
    return {
      id: "student",
      name: studentName,
      abs: totalAbsences,
      examTaken: examsTaken,
      examTotal: totalExams,
      attRate: attRate,
      avgGrade: avgGrade,
      firstTerm: Array.isArray(firstTerm) ? firstTerm : [], // Ensure it's always an array
      secondTerm: [],
      notifs: dashboard.notifications || [],
    }
  }

  // Get exam breakdown by assessment type
  const getExamBreakdown = () => {
    if (!data || !data.firstTerm) return {}
    
    const breakdown = {}
    
    data.firstTerm.forEach(subject => {
      if (subject.exams && Array.isArray(subject.exams)) {
        subject.exams.forEach(exam => {
          const typeKey = exam.type + ' Exam'
          if (!breakdown[typeKey]) {
            breakdown[typeKey] = { taken: 0, available: 0 }
          }
          
          breakdown[typeKey].available++
          if (exam.status === 'Taken') {
            breakdown[typeKey].taken++
          }
        })
      }
    })
    
    return breakdown
  }

  // Get absences breakdown by subject
  const getAbsencesBreakdown = () => {
    if (!data || !data.firstTerm) return []
    
    const breakdown = []
    
    data.firstTerm.forEach(subject => {
      if (subject.abs > 0) {
        breakdown.push({
          subject: subject.name,
          code: subject.code,
          absences: subject.abs,
          total: subject.present + subject.abs,
        })
      }
    })
    
    return breakdown.sort((a, b) => b.absences - a.absences)
  }

  // Get attendance breakdown by subject
  const getAttendanceBreakdown = () => {
    if (!data || !data.firstTerm) return []
    
    const breakdown = []
    
    data.firstTerm.forEach(subject => {
      const total = subject.present + subject.abs
      if (total > 0) {
        breakdown.push({
          subject: subject.name,
          code: subject.code,
          present: subject.present,
          absent: subject.abs,
          total: total,
          rate: subject.attRate,
        })
      }
    })
    
    return breakdown.sort((a, b) => b.rate - a.rate)
  }

  // Get grade breakdown by subject
  const getGradeBreakdown = () => {
    if (!data || !data.firstTerm) return []
    
    const breakdown = []
    
    data.firstTerm.forEach(subject => {
      if (subject.exams && Array.isArray(subject.exams)) {
        const completed = subject.exams.filter(exam => exam.status === 'Taken').length
        const total = subject.exams.length
        if (total > 0) {
          breakdown.push({
            subject: subject.name,
            code: subject.code,
            completed: completed,
            total: total,
            average: subject.grade || 0,
          })
        }
      }
    })
    
    return breakdown.sort((a, b) => {
      const avgA = parseFloat(a.average) || 0
      const avgB = parseFloat(b.average) || 0
      return avgB - avgA
    })
  }

  // Helper function to get notification icon based on type/title
  const getNotificationIcon = (notification) => {
    const type = notification.type || ''
    const title = notification.title || ''
    
    // Attendance-related notifications
    if (type === 'attendance' || title.includes('Attendance')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    
    // Grade-related notifications
    if (type === 'grade' || title.includes('Grade')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
    
    // Subject-related notifications
    if (title.includes('Subject')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
    
    // Default notification icon
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  // Helper function to get notification icon color class
  const getNotificationIconColor = (notification) => {
    const type = notification.type || ''
    const title = notification.title || ''
    
    if (type === 'attendance' || title.includes('Attendance')) {
      return 'text-emerald-500 bg-emerald-50'
    }
    if (type === 'grade' || title.includes('Grade')) {
      return 'text-blue-500 bg-blue-50'
    }
    if (title.includes('Subject')) {
      return 'text-amber-500 bg-amber-50'
    }
    return 'text-slate-500 bg-slate-50'
  }

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifDropdown && !event.target.closest('.relative')) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifDropdown])

  useEffect(() => {
    if (showProfileModal) {
      // Load current saved profile data into form when modal opens
      if (studentProfile) {
        setProfileForm({
          name: studentProfile.name || studentName,
          pic: null
        })
        // Show current saved photo as preview
        const currentPhoto = studentProfile.photo_url || studentProfile.photoURL || studentPic
        setProfilePreview(currentPhoto)
      } else {
        setProfileForm({
          name: studentName,
          pic: null
        })
        setProfilePreview(studentPic)
      }
      setProfileSaveSuccess(false) // Reset success message when modal opens
    }
  }, [showProfileModal, studentProfile, studentName, studentPic])

  const executeLogout = () => {
    // Student dashboard data is read-only from Firestore (synced by professor)
    sessionStorage.removeItem('currentUser')
    navigate('/login')
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-emerald-600"
    if (grade >= 85) return "text-blue-600"
    if (grade >= 75) return "text-amber-600"
    return "text-red-600"
  }

  const getGradeBg = (grade) => {
    if (grade >= 90) return "bg-emerald-600"
    if (grade >= 85) return "bg-blue-600"
    if (grade >= 75) return "bg-amber-600"
    return "bg-red-600"
  }

  const openSubjectModal = (subject, term) => {
    setSelectedSubject({ ...subject, term })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedSubject(null)
  }

  const getInitials = (name) => {
    if (!name || name === 'Student') return 'SU'
    return name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  }

  const handleProfilePicSelection = (file) => {
    if (file) {
      setProfileForm(prev => ({ ...prev, pic: file }))
      const reader = new FileReader()
      reader.onload = (evt) => {
        setProfilePreview(evt.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setProfileForm(prev => ({ ...prev, pic: null }))
      setProfilePreview(studentPic)
    }
  }

  // Compress and convert image to data URL
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas to resize/compress image
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress image
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to data URL with compression (0.8 quality for good balance)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressedDataUrl)
        }
        img.onerror = reject
        img.src = evt.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    
    // Clear any previous errors
    setProfileSaveError('')
    
    // Validation: Check if user is authenticated
    if (!studentUid) {
      setProfileSaveError('Unable to determine your account. Please sign in again.')
      return
    }

    // Validation: Name field
    const updatedName = profileForm.name?.trim() || ''
    if (!updatedName) {
      setProfileSaveError('Please enter your name.')
      return
    }
    if (updatedName.length < 2) {
      setProfileSaveError('Name must be at least 2 characters long.')
      return
    }
    if (updatedName.length > 100) {
      setProfileSaveError('Name must be less than 100 characters.')
      return
    }

    // Validation: Profile picture (if provided)
    let photoData = studentPic
    if (profileForm.pic) {
      const file = profileForm.pic
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setProfileSaveError('Please select a valid image file.')
        return
      }
      
      // Validate file size (max 10MB before compression)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        setProfileSaveError('Image file size must be less than 10MB. Please choose a smaller image.')
        return
      }
      
      try {
        photoData = await fileToDataUrl(file)
      } catch (error) {
        console.error('Failed to process image file', error)
        setProfileSaveError('Unable to process the selected image. Please try a different file.')
        return
      }
    }

    try {
      // Save to Firestore
      const updatedProfile = {
        ...(studentProfile || {}),
        name: updatedName,
        email: studentEmail || studentProfile?.email || '',
        studentId: studentProfile?.studentId || studentProfile?.student_id || '',
        department: studentProfile?.department || '',
        photoURL: photoData || null,
      }

      // Save to MySQL database (await to ensure data persists)
      const savedProfile = await setStudent(studentUid, updatedProfile)
      
      if (!savedProfile) {
        throw new Error('Failed to save profile to database')
      }

      // Update local state with saved data from database (ensures persistence)
      setStudentName(savedProfile.name || updatedName)
      const savedPhoto = savedProfile.photoURL || savedProfile.photo_url || photoData
      setStudentPic(savedPhoto)
      setStudentProfile(savedProfile)
      setProfilePreview(savedPhoto)

      // Update session storage with saved data from database
      const currentUser = sessionStorage.getItem('currentUser')
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser)
          userData.name = savedProfile.name || updatedName
          if (savedPhoto) {
            userData.photoURL = savedPhoto
          }
          sessionStorage.setItem('currentUser', JSON.stringify(userData))
        } catch (err) {
          console.warn('Failed to update session storage', err)
        }
      }

      // Show success message briefly, then close modal (under 3 seconds)
      setProfileSaveSuccess(true)

      // Close modal automatically after 1.5 seconds (well under 3 seconds)
      setTimeout(() => {
        setShowProfileModal(false)
        setProfileSaveSuccess(false)
        // Reset form for next time, but keep saved photo as preview
        setProfileForm({ name: savedProfile.name || studentName, pic: null })
        setProfilePreview(savedPhoto)
      }, 1500) // 1.5 seconds - fast close, well under 3 seconds
    } catch (error) {
      console.error('Failed to save student profile', error)
      // Show error message in UI instead of browser alert
      let errorMessage = 'Unable to save profile changes right now. Please try again.'
      
      // Check for specific error types
      if (error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Cannot connect to server. Please ensure the backend server is running on http://localhost:5000'
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Session expired. Please sign in again.'
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'You do not have permission to perform this action.'
        } else if (error.message.includes('404')) {
          errorMessage = 'Profile not found. Please try refreshing the page.'
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage = error.message
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      setProfileSaveError(errorMessage)
      setProfileSaveSuccess(false)
    }
  }

  // Use state variable for unread count
  const displayUnreadCount = unreadNotificationCount

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="glass shadow-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadowLg overflow-hidden">
                <img src="/assets/logos/um logo.png" alt="UM Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-bold textGrad">Student iTrack</h1>
                <p className="text-sm text-slate-600 font-medium">Smart Academic Monitoring System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="icon-button relative"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                  {displayUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center badge">
                      {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifDropdown && (() => {
                  // Format timestamp helper
                  const formatTimestamp = (timestamp) => {
                    const now = new Date()
                    const time = new Date(timestamp)
                    const diffMs = now - time
                    const diffMins = Math.floor(diffMs / 60000)
                    const diffHours = Math.floor(diffMs / 3600000)
                    const diffDays = Math.floor(diffMs / 86400000)
                    
                    if (diffMins < 1) return 'Just now'
                    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
                    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
                    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
                    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }
                  
                  // Check if notification is urgent (for yellow border)
                  const isUrgent = (notification) => {
                    const title = notification.title || ''
                    const message = notification.message || ''
                    return title.includes('Due Soon') || message.includes('due soon') || message.includes('overdue')
                  }
                  
                  // Get action button for student notifications
                  const getStudentAction = (notification) => {
                    const title = notification.title || ''
                    const message = notification.message || ''
                    
                    if (title.includes('Grade Posted') || message.includes('grade')) {
                      return { text: 'View Grade', action: () => {
                        // Navigate to grade detail view
                        setShowNotifDropdown(false)
                        // Could navigate to specific grade view here
                      }}
                    }
                    if (title.includes('Due Soon') || title.includes('Assignment')) {
                      return { text: 'View Assignment', action: () => {
                        // Navigate to assignment page
                        setShowNotifDropdown(false)
                      }}
                    }
                    if (title.includes('Announcement')) {
                      return { text: 'Read More', action: () => {
                        setShowNotifDropdown(false)
                      }}
                    }
                    if (title.includes('Material')) {
                      return { text: 'View Materials', action: () => {
                        setShowNotifDropdown(false)
                      }}
                    }
                    return null
                  }
                  
                  return (
                    <div className={`absolute right-0 mt-2 w-[420px] rounded-2xl shadow-2xl border-2 z-50 overflow-hidden ${
                      isDarkMode 
                        ? 'bg-[#1a1a1a] border-slate-700' 
                        : 'bg-white border-slate-200'
                    }`}>
                      {/* Header with Maroon Gradient */}
                      <div className={`p-5 border-b-2 ${
                        isDarkMode 
                          ? 'bg-gradient-to-br from-red-600 via-[#7A1315] to-red-800 border-slate-700' 
                          : 'border-slate-200 bg-gradient-to-br from-red-600 via-[#7A1315] to-red-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-white text-xl flex items-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                              </svg>
                              Notifications
                            </h3>
                            <p className="text-xs text-red-100 mt-1 font-medium">Academic Updates & Reminders</p>
                    </div>
                          {displayUnreadCount > 0 && (
                            <div className={`backdrop-blur-sm px-3 py-1 rounded-full border ${
                              isDarkMode 
                                ? 'bg-yellow-500/90 border-yellow-400' 
                                : 'bg-white/20 border-white/30'
                            }`}>
                              <span className={`font-bold text-sm ${
                                isDarkMode ? 'text-black' : 'text-white'
                              }`}>{displayUnreadCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Notifications List */}
                      <div className={`max-h-[500px] overflow-y-auto ${
                        isDarkMode 
                          ? 'bg-[#1a1a1a]' 
                          : 'bg-gradient-to-b from-slate-50 to-white'
                      }`}>
                      {notifications.length === 0 ? (
                          <div className="p-12 text-center">
                            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? 'bg-gradient-to-br from-red-900/30 to-rose-900/30'
                                : 'bg-gradient-to-br from-red-100 to-rose-100'
                            }`}>
                              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                            <p className={`text-sm font-medium ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-500'
                            }`}>No new notifications</p>
                            <p className={`text-xs mt-1 ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-400'
                            }`}>You're all caught up!</p>
                          </div>
                        ) : (
                          notifications.map(notification => {
                            const urgent = isUrgent(notification)
                            const action = getStudentAction(notification)
                            const timestamp = formatTimestamp(notification.timestamp)
                            
                            return (
                          <div
                            key={notification.id}
                                className={`relative m-3 rounded-xl shadow-md border-2 transition-all duration-200 cursor-pointer group ${
                                  isDarkMode
                                    ? 'bg-[#2c2c2c]'
                                    : 'bg-white'
                                } ${
                                  urgent ? 'border-yellow-400' : isDarkMode ? 'border-slate-700' : 'border-slate-200'
                                } ${!notification.read ? 'shadow-lg' : 'hover:shadow-lg'}`}
                            onClick={() => {
                              // Mark as read via API
                              markAsRead(notification.id).catch(err => {
                                console.error('Error marking notification as read:', err)
                              })
                              // Optimistically update UI
                              const updatedNotifications = notifications.map(n =>
                                n.id === notification.id ? { ...n, read: true } : n
                              )
                              setNotifications(updatedNotifications)
                              setUnreadNotificationCount(Math.max(0, unreadNotificationCount - 1))
                            }}
                          >
                                {/* Card Content */}
                                <div className="p-4">
                                  {/* Header - Bold Title */}
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className={`text-sm font-bold leading-tight ${
                                      isDarkMode
                                        ? urgent ? 'text-yellow-400' : 'text-white'
                                        : 'text-[#7A1315]'
                                    }`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className={`flex-shrink-0 w-2 h-2 rounded-full ml-2 ${
                                        isDarkMode ? 'bg-yellow-400' : 'bg-[#7A1315]'
                                      }`}></div>
                                    )}
                              </div>
                              
                                  {/* Body - Brief Single Sentence */}
                                  <p className={`text-xs leading-relaxed mb-3 ${
                                    isDarkMode ? 'text-white' : 'text-slate-700'
                                  }`}>
                                    {notification.message}
                                  </p>
                                  
                                  {/* Footer - Timestamp and Maroon Action Button */}
                                  <div className={`flex items-center justify-between pt-2 border-t ${
                                    isDarkMode ? 'border-slate-700' : 'border-slate-100'
                                  }`}>
                                    <p className={`text-xs ${
                                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                    }`}>
                                      {timestamp}
                                    </p>
                                    {action && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          const updatedNotifications = notifications.map(n =>
                                            n.id === notification.id ? { ...n, read: true } : n
                                          )
                                          setNotifications(updatedNotifications)
                                          action.action()
                                        }}
                                        className="bg-[#7A1315] hover:bg-red-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                      >
                                        {action.text}
                                      </button>
                                    )}
                              </div>
                            </div>
                          </div>
                            )
                          })
                      )}
                    </div>
                      
                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className={`p-4 border-t-2 ${
                          isDarkMode 
                            ? 'border-slate-700 bg-[#1a1a1a]' 
                            : 'border-slate-200 bg-gradient-to-r from-slate-50 to-red-50'
                        }`}>
                      <button
                        onClick={() => {
                          // Mark all as read via API
                          markAllAsRead().catch(err => {
                            console.error('Error marking all notifications as read:', err)
                          })
                          // Optimistically update UI
                          const updatedNotifications = notifications.map(n => ({ ...n, read: true }))
                          setNotifications(updatedNotifications)
                          setUnreadNotificationCount(0)
                        }}
                            className="w-full text-center text-sm font-bold text-white hover:text-white bg-[#7A1315] hover:bg-red-800 px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                            Clear All Notifications
                      </button>
                  </div>
                )}
                    </div>
                  )
                })()}
              </div>

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-3 rounded-2xl border border-slate-200 px-3 py-2 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-maroon-500"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-red-800 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {studentPic && studentPic !== '/assets/images/trisha.jpg' ? (
                    <img src={studentPic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    getInitials(studentName)
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Profile</p>
                  <p className="text-sm font-semibold text-slate-700">{studentName}</p>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              
              <button
                onClick={handleLogoutClick}
                className="logout-btn text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-2 shadow-lg bg-maroon-600 hover:bg-maroon-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 text-center">
              Confirm Logout
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 text-center">
              Are you sure you want to logout?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-maroon-600 text-maroon-700 bg-white hover:bg-red-50 dark:bg-slate-900 dark:text-red-200 dark:border-red-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-maroon-600 hover:bg-maroon-700 shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 fade">
        {/* Student Academic Summary Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 slide-up">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#7A1315]">Student Academic Summary</h2>
            <p className="mt-2 text-slate-600">Track assessments, attendance, and grades across all enrolled subjects.</p>
        </div>

          {/* Stats Cards - Using Real-Time Firestore Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            // Calculate statistics from real-time Firestore data
            const stats = calculateRealTimeStatistics()
            
            return [
            {
              key: 'absences',
              label: 'Absences',
                value: stats.absences,
              description: 'This semester',
                iconClass: 'bg-rose-100 text-rose-500',
                iconPath: 'M12 14l4-4m0 0l-4-4m4 4H8m8 0a6 6 0 11-12 0 6 6 0 0112 0z',
                color: 'text-slate-900',
            },
            {
              key: 'exams',
                label: 'Total Assessments',
                value: stats.totalExams > 0 ? `${stats.examsCompleted}/${stats.totalExams}` : 'N/A',
                description: stats.totalExams > 0 
                  ? `${Math.round((stats.examsCompleted / stats.totalExams) * 100)}% completed` 
                  : 'No assessments recorded',
                iconClass: 'bg-yellow-100 text-yellow-500',
                iconPath: 'M7 7h10M7 11h6m-2 4h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
                color: 'text-slate-900',
            },
            {
              key: 'attendance',
              label: 'Attendance Rate',
                value: `${stats.attendanceRate}%`,
                description: stats.attendanceRate >= 90 ? 'Excellent attendance' 
                  : stats.attendanceRate >= 75 ? 'Good attendance' 
                  : stats.attendanceRate >= 50 ? 'Fair attendance' 
                  : 'Needs improvement',
                iconClass: 'bg-sky-100 text-sky-500',
                iconPath: 'M5 13l4 4L19 7',
                color: 'text-slate-900',
            },
            {
              key: 'grade',
              label: 'Average Grade',
                value: `${stats.averageGrade}%`,
                description: stats.averageGrade >= 90 ? 'Overall performance' 
                  : stats.averageGrade >= 85 ? 'Overall performance' 
                  : stats.averageGrade >= 80 ? 'Overall performance' 
                  : stats.averageGrade >= 75 ? 'Overall performance' 
                  : 'Overall performance',
                iconClass: 'bg-sky-100 text-sky-500',
                iconPath: 'M12 17l-5 3 1.9-5.4L4 10h6l2-6 2 6h6l-4.9 4.6L17 20z',
                color: 'text-slate-900',
            },
          ].map((card) => {
            return (
              <div
                key={card.key}
                  className="metric-card rounded-2xl p-5 shadow-sm relative overflow-hidden bg-white/80 border border-white/60"
                style={{ minHeight: '140px' }}
              >
                <div className="w-full h-full p-5 box-border flex flex-col">
                    <div className={`metric-icon ${card.iconClass} mb-2 p-2 rounded-lg w-fit`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d={card.iconPath} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      </div>
                    <p className="text-sm font-semibold mb-1 text-slate-500">{card.label}</p>
                    <p className={`text-4xl font-bold mb-1 break-words ${card.color}`}>{card.value}</p>
                    <p className="text-xs mb-1 text-slate-400">{card.description}</p>
                </div>
              </div>
            )
            })
          })()}
          </div>
        </div>

        {/* Subjects Section */}
        <div className="bg-white rounded-xl shadow-sm p-5 slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">1st Term Subjects</h2>
          </div>
          
          {data.firstTerm && Array.isArray(data.firstTerm) && data.firstTerm.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.firstTerm.map((subject, index) => (
              <div
                  key={subject.id || subject.code || index}
                onClick={() => openSubjectModal(subject, 'first')}
                className="subject-card bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-all slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-4/5">
                      <h3 className="font-bold text-slate-800 text-lg truncate">{subject.id || subject.code} - {subject.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Code: {subject.code} | 1st Term</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getGradeColor(subject.grade)}`}>
                      {subject.grade || "N/A"}%
                    </div>
                    <p className="text-xs text-slate-500">Current</p>
                  </div>
                </div>
                
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-4">
                  <div className={`h-full ${getGradeBg(subject.grade)} progress`} style={{ width: `${subject.grade || 0}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-xs text-slate-500 mr-2">Attendance:</span>
                    <span className={`text-xs font-medium ${
                      subject.attRate >= 90 ? "text-emerald-600" :
                      subject.attRate >= 80 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {subject.attRate || "N/A"}%
                    </span>
                  </div>
                  <button className="text-xs text-slate-500 hover:text-slate-700">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Not Enrolled in Any Subjects</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                You are not currently enrolled in any subjects for this term. Please contact your professor to be enrolled in subjects.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Subject Detail Modal */}
      {showModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scroll shadow-2xl modal-appear" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sticky-header mb-6 pb-4 border-b border-slate-200 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedSubject.id} - {selectedSubject.name}</h3>
                  <p className="text-slate-600 text-sm">Subject Code: {selectedSubject.code} | {selectedSubject.term === 'first' ? '1st' : '2nd'} Term Subject</p>
                </div>
                <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-100">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
            </div>
            
            {/* Modal content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-5">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Grade Performance</h4>
                  <p className="text-sm text-slate-500 mb-4">Your current grade for this subject</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <i className="fa-solid fa-graduation-cap text-red-600"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Current Grade</span>
                        <span className={`text-2xl font-bold ${getGradeColor(selectedSubject.grade)}`}>
                          {selectedSubject.grade || "N/A"}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${getGradeBg(selectedSubject.grade)} progress grade-progress`} style={{ width: `${selectedSubject.grade || 0}%` }}></div>
                  </div>
                </div>

                {/* Exams/Grades Table with Dates */}
                {selectedSubject.exams && selectedSubject.exams.length > 0 && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">Exams & Grades</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assessment</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedSubject.exams.map((exam, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-800">{exam.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600">{exam.type}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">
                                {exam.score !== undefined ? `${exam.score}/${exam.maxPoints || 100}` : 'N/A'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
                                  exam.status === 'Taken' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {exam.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500">
                                {exam.date ? (() => {
                                  try {
                                    const date = new Date(exam.date)
                                    return date.toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })
                                  } catch {
                                    return exam.date
                                  }
                                })() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-1 space-y-5">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="text-lg font-bold text-slate-800 mb-4">Attendance Summary</h4>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center space-x-3">
                        <i className="fa-solid fa-check-circle text-emerald-600"></i>
                        <span className="font-medium text-slate-700 text-sm">Attendance Rate</span>
                      </div>
                      <span className="font-bold text-emerald-600">{selectedSubject.attRate || "N/A"}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex items-center space-x-3">
                        <i className="fa-solid fa-user-slash text-red-600"></i>
                        <span className="font-medium text-slate-700 text-sm">Absences</span>
                      </div>
                      <span className="font-bold text-red-600">{selectedSubject.abs || "N/A"}</span>
                    </div>
                  </div>

                  {/* Attendance Records with Dates */}
                  {selectedSubject.attendanceRecords && selectedSubject.attendanceRecords.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-2">Attendance Records</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedSubject.attendanceRecords.map((record, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                              record.status === 'present' 
                                ? 'bg-emerald-50 border border-emerald-100' 
                                : 'bg-red-50 border border-red-100'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <i className={`fa-solid ${record.status === 'present' ? 'fa-check-circle text-emerald-600' : 'fa-user-slash text-red-600'}`}></i>
                              <span className="font-medium text-slate-700 capitalize">{record.status}</span>
                </div>
                            <span className="text-slate-500">
                              {(() => {
                                try {
                                  const date = new Date(record.date)
                                  return date.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                } catch {
                                  return record.date
                                }
                              })()}
                            </span>
              </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Profile Modal */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setShowProfileModal(false)
            setProfileSaveSuccess(false)
            setProfileSection('account')
          }}
        >
          <div
            className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col lg:flex-row ${
              isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Identity Block - Sidebar (Desktop) / Top (Mobile) */}
            <div className={`lg:w-80 flex-shrink-0 ${
              isDarkMode 
                ? 'bg-[#7A1315]' 
                : 'bg-gradient-to-b from-[#7A1315] to-red-800'
            } flex flex-col`}>
              {/* Profile Picture Container */}
              <div className="p-8 flex flex-col items-center border-b border-red-900/30">
                <div className="relative mb-4 group">
                  <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-red-600 to-[#7A1315] flex items-center justify-center overflow-hidden">
                    {profilePreview || studentPic ? (
                      <img 
                        src={profilePreview || studentPic} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, show initials instead
                          const imgElement = e.target
                          const parent = imgElement.parentElement
                          if (parent) {
                            imgElement.style.display = 'none'
                            const initialsSpan = document.createElement('span')
                            initialsSpan.className = 'text-white text-3xl font-semibold tracking-wide'
                            initialsSpan.textContent = getInitials(profileForm.name || studentName)
                            parent.appendChild(initialsSpan)
                          }
                        }}
                      />
                    ) : (
                      <span className="text-white text-3xl font-semibold tracking-wide">
                      {getInitials(profileForm.name || studentName)}
                    </span>
                  )}
                </div>
                  {/* Change Photo Button */}
                  <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProfilePicSelection(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={profileSaveSuccess}
                    />
                  </label>
              </div>
                
                {/* User Name - Bold */}
                <h3 className="text-white font-bold text-2xl text-center mb-2">
                  {profileForm.name || studentName}
                </h3>
                
                {/* User Role & Identifier */}
                <p className="text-red-100 text-sm font-medium mb-1">Student</p>
                <p className="text-red-200 text-xs mb-1">{studentProfile?.studentId || studentProfile?.student_id || 'Student ID'}</p>
                <p className="text-red-200 text-xs">{studentEmail || studentProfile?.email || 'Email'}</p>
            </div>

              {/* Settings Navigation - Mobile: Horizontal, Desktop: Vertical */}
              <nav className="flex-1 py-4 overflow-y-auto">
                <button
                  onClick={() => setProfileSection('account')}
                  className={`w-full lg:w-full px-6 py-4 text-left text-white font-medium transition-all flex items-center space-x-3 ${
                    profileSection === 'account' 
                      ? 'bg-red-900/50 border-l-4 border-yellow-400' 
                      : 'hover:bg-red-900/30'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Account Settings</span>
                </button>
                
                <button
                  onClick={() => setProfileSection('appearance')}
                  className={`w-full lg:w-full px-6 py-4 text-left text-white font-medium transition-all flex items-center space-x-3 ${
                    profileSection === 'appearance' 
                      ? 'bg-red-900/50 border-l-4 border-yellow-400' 
                      : 'hover:bg-red-900/30'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span>Appearance</span>
                </button>
              </nav>

              {/* Close Button */}
              <div className="p-4 border-t border-red-900/30">
                <button
                  onClick={() => {
                    setShowProfileModal(false)
                    setProfileSaveSuccess(false)
                    setProfileSection('account')
                  }}
                  className="w-full px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-white font-medium rounded-lg transition-all"
                >
                  Close Profile
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 overflow-y-auto ${
              isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
            }`}>
              <div className="max-w-4xl mx-auto p-6 lg:p-8">
                {/* Account Settings Section */}
                {profileSection === 'account' && (
                  <div className="space-y-6">
              <div>
                      <h2 className={`text-3xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Account Settings
                      </h2>
                      <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                        Manage your personal information
                      </p>
                    </div>

                    <div className={`rounded-2xl shadow-lg border p-6 ${
                      isDarkMode 
                        ? 'bg-[#1a1a1a] border-slate-700' 
                        : 'bg-white border-slate-200'
                    }`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Personal Information
                      </h3>
                      <form onSubmit={handleProfileSave} className="space-y-5">
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${
                            isDarkMode ? 'text-white' : 'text-slate-700'
                          }`}>
                            Name
                          </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7A1315] ${
                              isDarkMode 
                                ? 'bg-[#2c2c2c] border-[#7A1315] text-white' 
                                : 'bg-white border-slate-300 text-slate-800'
                            }`}
                  required
                  disabled={profileSaveSuccess}
                />
              </div>
                        
              <div>
                          <label className={`block text-sm font-semibold mb-2 ${
                            isDarkMode ? 'text-white' : 'text-slate-700'
                          }`}>
                            Student ID
                          </label>
                          <input
                            type="text"
                            value={studentProfile?.studentId || studentProfile?.student_id || ''}
                            disabled
                            className={`w-full px-4 py-3 border rounded-lg ${
                              isDarkMode 
                                ? 'bg-[#1a1a1a] border-slate-600 text-slate-400' 
                                : 'bg-slate-50 border-slate-300 text-slate-600'
                            }`}
                          />
                          <small className={`text-xs mt-1 block ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Your student identification number
                          </small>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${
                            isDarkMode ? 'text-slate-200' : 'text-slate-700'
                          }`}>
                            Profile Picture
                          </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProfilePicSelection(e.target.files[0])}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#7A1315] file:text-white hover:file:bg-red-800"
                  disabled={profileSaveSuccess}
                />
                          <small className={`block text-xs mt-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Choose a square image for best results
                          </small>
              </div>
              
                        {/* Error Message */}
                        {profileSaveError && (
                          <div className={`rounded-xl p-4 flex items-center space-x-3 border ${
                            isDarkMode 
                              ? 'bg-red-900/30 border-red-700' 
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <svg className={`w-5 h-5 flex-shrink-0 ${
                              isDarkMode ? 'text-red-400' : 'text-red-600'
                            }`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className={`font-medium ${
                              isDarkMode ? 'text-red-300' : 'text-red-800'
                            }`}>
                              {profileSaveError}
                            </p>
                          </div>
                        )}
              
                        {/* Success Message */}
                        {profileSaveSuccess && (
                          <div className={`rounded-xl p-4 flex items-center space-x-3 border ${
                            isDarkMode 
                              ? 'bg-emerald-900/30 border-emerald-700' 
                              : 'bg-emerald-50 border-emerald-200'
                          }`}>
                            <svg className={`w-5 h-5 flex-shrink-0 ${
                              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                            }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                            <p className={`font-medium ${
                              isDarkMode ? 'text-emerald-300' : 'text-emerald-800'
                            }`}>
                              Profile updated successfully! Your changes have been saved.
                            </p>
              </div>
                        )}
              
                        <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false)
                    setProfileSaveSuccess(false)
                    setProfileSection('account')
                    // Reset preview to original if cancelled
                    if (studentProfile?.photo_url || studentProfile?.photoURL) {
                      setProfilePreview(studentProfile.photo_url || studentProfile.photoURL)
                    } else {
                      setProfilePreview(null)
                    }
                    setProfileForm({ name: studentProfile?.name || studentName, pic: null })
                  }}
                            className={`px-5 py-2 rounded-xl font-semibold ${
                              isDarkMode 
                                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                >
                  {profileSaveSuccess ? 'Close' : 'Cancel'}
                </button>
                <button
                  type="submit"
                            className="px-6 py-2 rounded-xl bg-[#7A1315] text-white font-semibold hover:bg-red-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={profileSaveSuccess}
                >
                  {profileSaveSuccess ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
                    </div>
                  </div>
                )}

                {/* Appearance Section - Dark/Light Mode Toggle */}
                {profileSection === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className={`text-3xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Appearance
                      </h2>
                      <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                        Customize your interface theme and display preferences
                      </p>
                    </div>

                    <div className={`rounded-2xl shadow-lg border p-6 ${
                      isDarkMode 
                        ? 'bg-[#1a1a1a] border-slate-700' 
                        : 'bg-white border-slate-200'
                    }`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Interface Theme
                      </h3>
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${
                          isDarkMode 
                            ? 'bg-[#2c2c2c] border-slate-700' 
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center space-x-4">
                            {isDarkMode ? (
                              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            ) : (
                              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )}
                            <div>
                              <p className={`font-semibold ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`}>
                                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                              </p>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {isDarkMode 
                                  ? 'Dark theme for reduced eye strain' 
                                  : 'Light theme for better visibility'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={toggleTheme}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:ring-offset-2 ${
                              isDarkMode ? 'bg-[#7A1315]' : 'bg-slate-300'
                            }`}
                            aria-label="Toggle dark mode"
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                isDarkMode ? 'translate-x-9' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          The theme applies system-wide to all screens, maintaining consistent readability and navigation across the application.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Student

