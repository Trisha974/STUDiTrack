import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './Student.css'
import { getStudentByUid, setStudent, updateStudent, getStudentByEmail, getStudentByNumericalId } from '../../services/students'
import { getEnrollmentsByStudent, subscribeToStudentEnrollments } from '../../services/enrollments'
import { getGradesByStudent, subscribeToStudentGrades } from '../../services/grades'
import { getAttendanceByStudent, subscribeToStudentAttendance } from '../../services/attendance'
import { getNotifications, subscribeToNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../services/notifications'
import { getCourseById } from '../../services/courses'
import { useThemeManagement } from '../../hooks/useThemeManagement'
import { useDataFetching } from '../../hooks/useDataFetching'
import { useStudentDashboardTransform } from '../../hooks/useStudentDashboardTransform'
import { useStudentUtilities } from '../../hooks/useStudentUtilities'
import { useStudentDataLoading } from '../../hooks/useStudentDataLoading'
import { useStudentNotifications } from '../../hooks/useStudentNotifications'
import { getCurrentUserData, updateSessionUserFields } from '../../utils/authHelpers'
import ProfileModal from './components/ProfileModal'

const defaultData = {
  id: "default",
  name: "Student",
  abs: 0,
  examTaken: 0,
  examTotal: 0,
  attRate: 0,
  avgGrade: 0,
  firstTerm: [],
  secondTerm: [],
  notifs: []
}

function Student() {
  const navigate = useNavigate()

  const theme = useThemeManagement()
  const { isDarkMode } = theme
  const dataFetching = useDataFetching()
  const {
    transformDashboardDataFromMySQL,
    calculateDashboardStatisticsFallback,
    calculateRealTimeStatistics,
  } = useStudentDashboardTransform()
  
  const {
    getGradeColor,
    getGradeBg,
    getExamBreakdown,
    getAbsencesBreakdown,
    getAttendanceBreakdown,
    getGradeBreakdown,
    getNotificationIcon,
    getNotificationIconColor,
    getInitials
  } = useStudentUtilities()
  const [data, setData] = useState(defaultData)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentSort, setCurrentSort] = useState('none')
  const [showModal, setShowModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTerm, setFilterTerm] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showArchived, setShowArchived] = useState(false)
  const [examViewMode, setExamViewMode] = useState('all')
  const [examSearchQuery, setExamSearchQuery] = useState('')
  const [examSortBy, setExamSortBy] = useState('date')
  const [examSortOrder, setExamSortOrder] = useState('desc')
  const [examPage, setExamPage] = useState(1)
  const [examItemsPerPage] = useState(5)
  const [expandedExamTypes, setExpandedExamTypes] = useState({})
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [studentName, setStudentName] = useState('Student')
  const [studentPic, setStudentPic] = useState('/assets/images/trisha.jpg')
  const [studentUid, setStudentUid] = useState(null)
  const [studentEmail, setStudentEmail] = useState('')
  const [studentProfile, setStudentProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({ name: '', pic: null, removePhoto: false })
  const [profilePreview, setProfilePreview] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)
  const [profileSaveError, setProfileSaveError] = useState('')
  const [profileSection, setProfileSection] = useState('account')
  const realtimeUnsubscribeRef = useRef(null)
  const previousDataRef = useRef(null)
  const originalStudentPicRef = useRef(null)
  
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

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    const handlePopState = (event) => {
      const userData = getCurrentUserData()
      if (userData && window.location.pathname === '/login') {
        event.preventDefault()
        window.history.pushState(null, '', '/student')
        navigate('/student', { replace: true })
      }
    }

    window.addEventListener('popstate', handlePopState)
    
    window.history.pushState(null, '', window.location.pathname)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigate])

  const { loadStudentProfile } = useStudentDataLoading({
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
  })

  const { refreshNotifications } = useStudentNotifications({
    studentMySQLId,
    setNotifications,
    setUnreadNotificationCount
  })

  useEffect(() => {
    const isProcessing = sessionStorage.getItem('studentProfileProcessing')
    if (isProcessing === 'true') {
      return
    }

    loadStudentProfile()
    
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

  const enrollmentsRef = useRef(enrollments)
  const coursesRef = useRef(courses)
  const liveGradesRef = useRef(liveGrades)
  const liveAttendanceRef = useRef(liveAttendance)
  const studentNameRef = useRef(studentName)

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

  useEffect(() => {
    if (!studentMySQLId) {
      return
    }

    refreshNotifications()

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
          currentStudentName,
          notifications || []
        )
        setData(transformedData)
      }
    }

    const gradesUnsubscribe = subscribeToStudentGrades(studentMySQLId, (grades) => {
      setLiveGrades(grades)
      setTimeout(recalculateData, 0)
    })

    const attendanceUnsubscribe = subscribeToStudentAttendance(studentMySQLId, (attendance) => {
      setLiveAttendance(attendance)
      setTimeout(recalculateData, 0)
    })

    const enrollmentsUnsubscribe = subscribeToStudentEnrollments(studentMySQLId, async (enrollmentsData) => {
      setEnrollments(enrollmentsData)
      
      const enrollmentsWithCourseData = enrollmentsData.filter(e => e.code && e.course_name)
      const enrollmentsNeedingCourseLoad = enrollmentsData.filter(e => !e.code || !e.course_name)
      
      
      const coursePromises = enrollmentsNeedingCourseLoad.map(enrollment => 
        getCourseById(enrollment.course_id).catch(() => null)
      )
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
        liveGradesRef.current || [],
        liveAttendanceRef.current || [],
        studentNameRef.current || 'Student'
        )
      
      
        setData(transformedData)
    })

    const notificationsUnsubscribe = subscribeToNotifications((notificationsData) => {
      let notificationsArray = []
      if (Array.isArray(notificationsData)) {
        notificationsArray = notificationsData
      } else if (notificationsData && typeof notificationsData === 'object') {
        const keys = Object.keys(notificationsData)
        
        for (const key of ['data', 'notifications', 'items', 'results', 'list', 'array']) {
          if (Array.isArray(notificationsData[key])) {
            notificationsArray = notificationsData[key]
            break
          }
        }
        
        if (notificationsArray.length === 0) {
          for (const key of keys) {
            if (Array.isArray(notificationsData[key])) {
              notificationsArray = notificationsData[key]
              break
            }
          }
        }
        
        if (notificationsArray.length === 0) {
          console.error('❌ Subscription: Object but no array found!')
          console.error('❌ Object keys:', keys)
          console.error('❌ Object structure:', JSON.stringify(notificationsData).substring(0, 500))
          notificationsArray = []
        }
      } else {
        console.warn('⚠️ Subscription: Unexpected data type:', typeof notificationsData)
      }
      
      const finalNotificationsArraySub = Array.isArray(notificationsArray) ? notificationsArray : []
      
      setNotifications(finalNotificationsArraySub)
      
      const unread = notificationsArray.filter(n => {
        const readValue = n.read
        const isUnread = readValue === false || readValue === 0 || readValue === '0' || readValue === null || readValue === undefined
        return isUnread
      }).length
      
      setUnreadNotificationCount(unread)
    }, { limit: 50 })

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
  }, [studentMySQLId])

  
  /*
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
  */

  /*
  const calculateRealTimeStatistics = () => {
    if (data && data.firstTerm && data.firstTerm.length > 0) {
      let totalAbs = 0
      let totalExams = 0
      let examsTaken = 0
      let totalScore = 0
      let totalMax = 0
      let totalPresent = 0
      let totalSessions = 0

      data.firstTerm.forEach(subject => {
        if (subject.abs !== undefined) {
          totalAbs += subject.abs || 0
        }
        
        if (subject.attendanceRecords && Array.isArray(subject.attendanceRecords)) {
          subject.attendanceRecords.forEach(record => {
            if (record.status === 'present') {
              totalPresent++
              totalSessions++
            } else if (record.status === 'absent') {
              totalAbs++
              totalSessions++
            }
          })
        }
        
        if (subject.exams && Array.isArray(subject.exams)) {
          subject.exams.forEach(exam => {
            totalExams++
            if (exam.status === 'Taken' && exam.score !== undefined && exam.maxPoints !== undefined) {
              examsTaken++
              totalScore += parseFloat(exam.score) || 0
              totalMax += parseFloat(exam.maxPoints) || 0
            }
          })
        }
      })

      const attendanceRate = totalSessions > 0 
        ? Math.round((totalPresent / totalSessions) * 100) 
        : 0
      
      const averageGrade = totalMax > 0 
        ? Math.round((totalScore / totalMax) * 100) 
        : 0

      return {
        absences: totalAbs,
        examsCompleted: examsTaken,
        totalExams: totalExams,
        attendanceRate: attendanceRate,
        averageGrade: averageGrade,
      }
    }

    const liveAbsences = liveAttendance.filter(record => record.status === 'absent').length
    
    const gradesWithScores = liveGrades.filter(grade => 
      grade.score !== undefined && grade.score !== null && 
      grade.max_points !== undefined && grade.max_points !== null
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

    const fallbackStats = calculateDashboardStatisticsFallback(data)

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
  */

  const transformDashboardData = (dashboard, studentName) => {
    const subjects = dashboard.subjects || []
    const grades = dashboard.grades || {}
    const attendance = dashboard.attendance || {}
    
    let totalAbsences = 0
    let totalExams = 0
    let examsTaken = 0
    let totalScore = 0
    let totalMax = 0
    let totalPresent = 0
    let totalSessions = 0
    
    const firstTerm = subjects.map(subject => {
      const subjectGrades = grades[subject.code] || {}
      const subjectExams = []
      let subjectScore = 0
      let subjectMax = 0
      
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
      
      const subjectLiveGrades = liveGrades.filter(grade => {
        return true
      })
      
      subjectLiveGrades.forEach(grade => {
        const existingExam = subjectExams.find(exam => 
          exam.name === grade.assessmentTitle && 
          (exam.type.toLowerCase() === (grade.assessmentType || '').toLowerCase())
        )
        if (!existingExam && grade.score !== undefined) {
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
          const firestoreDate = grade.date || grade.createdAt || grade.updatedAt
          if (firestoreDate && (!existingExam.date || new Date(firestoreDate) > new Date(existingExam.date || 0))) {
            existingExam.date = firestoreDate
          }
        }
      })
      
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
      
      const subjectLiveAttendance = liveAttendance.filter(att => {
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
      firstTerm: Array.isArray(firstTerm) ? firstTerm : [],
      secondTerm: [],
      notifs: dashboard.notifications || [],
    }
  }


  useEffect(() => {
    if (showNotifDropdown && studentMySQLId) {
      if (!Array.isArray(notifications) || notifications.length === 0) {
        const timeoutId = setTimeout(() => {
          refreshNotifications()
        }, 200)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [showNotifDropdown, studentMySQLId, refreshNotifications, notifications])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifDropdown && !event.target.closest('.relative')) {
        setShowNotifDropdown(false)
      }
      if (showProfileDropdown && !event.target.closest('.relative')) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifDropdown, showProfileDropdown])

  useEffect(() => {
    if (showProfileModal) {
      const currentPhoto = studentProfile?.photo_url || studentProfile?.photoURL || studentPic
      originalStudentPicRef.current = currentPhoto
      
      if (studentProfile) {
        setProfileForm({
          name: studentProfile.name || studentName,
          pic: null,
          removePhoto: false
        })
        setProfilePreview(currentPhoto)
      } else {
        setProfileForm({
          name: studentName,
          pic: null,
          removePhoto: false
        })
        setProfilePreview(studentPic)
      }
      setProfileSaveSuccess(false)
    } else {
      if (originalStudentPicRef.current !== null) {
        setProfilePreview(originalStudentPicRef.current)
        setProfileForm(prev => ({ ...prev, pic: null, removePhoto: false }))
      }
    }
  }, [showProfileModal, studentProfile, studentName, studentPic])

  const executeLogout = () => {
    sessionStorage.removeItem('currentUser')
    navigate('/login', { replace: true })
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }


  const openSubjectModal = (subject, term) => {
    setSelectedSubject({ ...subject, term })
    setShowModal(true)
    setExamViewMode('all')
    setExamSearchQuery('')
    setExamSortBy('date')
    setExamSortOrder('desc')
    setExamPage(1)
    setExpandedExamTypes({})
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedSubject(null)
    setExamViewMode('all')
    setExamSearchQuery('')
    setExamSortBy('date')
    setExamSortOrder('desc')
    setExamPage(1)
    setExpandedExamTypes({})
  }

  const isSubjectArchived = (subject) => {
    let lastActivityDate = null
    
    if (subject.exams && Array.isArray(subject.exams) && subject.exams.length > 0) {
      const examDates = subject.exams
        .map(exam => {
          if (exam.date) {
            const date = new Date(exam.date)
            return !isNaN(date.getTime()) ? date : null
          }
          return null
        })
        .filter(date => date !== null)
      
      if (examDates.length > 0) {
        const mostRecentExam = new Date(Math.max(...examDates.map(d => d.getTime())))
        if (!lastActivityDate || mostRecentExam > lastActivityDate) {
          lastActivityDate = mostRecentExam
        }
      }
    }
    
    if (subject.attendanceRecords && Array.isArray(subject.attendanceRecords) && subject.attendanceRecords.length > 0) {
      const attendanceDates = subject.attendanceRecords
        .map(record => {
          if (record.date) {
            const date = new Date(record.date)
            return !isNaN(date.getTime()) ? date : null
          }
          return null
        })
        .filter(date => date !== null)
      
      if (attendanceDates.length > 0) {
        const mostRecentAttendance = new Date(Math.max(...attendanceDates.map(d => d.getTime())))
        if (!lastActivityDate || mostRecentAttendance > lastActivityDate) {
          lastActivityDate = mostRecentAttendance
        }
      }
    }
    
    if (subject.enrolledAt) {
      const enrolledDate = new Date(subject.enrolledAt)
      if (!isNaN(enrolledDate.getTime())) {
        if (!lastActivityDate || enrolledDate > lastActivityDate) {
          lastActivityDate = enrolledDate
        }
      }
    }
    
    if (lastActivityDate) {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      return lastActivityDate < oneYearAgo
    }
    
    return false
  }

  const getFilteredAndSortedSubjects = (subjects) => {
    if (!subjects || !Array.isArray(subjects)) return []
    
    const archivedSubjects = subjects.filter(subject => isSubjectArchived(subject))
    const currentSubjects = subjects.filter(subject => !isSubjectArchived(subject))
    
    let subjectsToFilter = filterTerm === 'archived' ? archivedSubjects : currentSubjects
    
    let filtered = subjectsToFilter.filter(subject => {
      const searchLower = searchQuery.toLowerCase()
      const name = (subject.name || '').toLowerCase()
      const code = (subject.code || '').toLowerCase()
      const id = (subject.id || '').toLowerCase()
      return name.includes(searchLower) || code.includes(searchLower) || id.includes(searchLower)
    })
    
    if (filterTerm !== 'all' && filterTerm !== 'archived') {
      filtered = filtered.filter(subject => {
        if (filterTerm === 'first') return !subject.term || subject.term === 'first'
        if (filterTerm === 'second') return subject.term === 'second'
        return true
      })
    }
    
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
          break
        case 'code':
          aValue = (a.code || '').toLowerCase()
          bValue = (b.code || '').toLowerCase()
          break
        case 'grade':
          aValue = a.grade || 0
          bValue = b.grade || 0
          break
        case 'attendance':
          aValue = a.attRate || 0
          bValue = b.attRate || 0
          break
        default:
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
    
    return filtered
  }

  const getPaginatedSubjects = (subjects) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return subjects.slice(startIndex, endIndex)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterTerm, sortBy, sortOrder])


  const handleProfileUpdate = (updatedData) => {
    setStudentName(updatedData.name || studentName)
    const savedPhoto = updatedData.photoURL || null
    setStudentPic(savedPhoto)
    if (updatedData.profile) {
      setStudentProfile(updatedData.profile)
    }
    setProfilePreview(savedPhoto)
    originalStudentPicRef.current = savedPhoto || null
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    
    setProfileSaveError('')
    
    if (!studentUid) {
      setProfileSaveError('Unable to determine your account. Please sign in again.')
      return
    }

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

    let photoData = studentPic
    if (profileForm.removePhoto || (profilePreview === null && studentPic && !profileForm.pic)) {
      photoData = null
    } else if (profileForm.pic) {
      const file = profileForm.pic
      
      if (!file.type.startsWith('image/')) {
        setProfileSaveError('Please select a valid image file.')
        return
      }
      
      const maxSize = 10 * 1024 * 1024
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
      const updatedProfile = {
        ...(studentProfile || {}),
        name: updatedName,
        email: studentEmail || studentProfile?.email || '',
        studentId: studentProfile?.studentId || studentProfile?.student_id || '',
        department: studentProfile?.department || '',
        photoURL: photoData || null,
      }

      const savedProfile = await setStudent(studentUid, updatedProfile)
      
      if (!savedProfile) {
        throw new Error('Failed to save profile to database')
      }

      setStudentName(savedProfile.name || updatedName)
      const savedPhoto = savedProfile.photoURL || savedProfile.photo_url || photoData
      setStudentPic(savedPhoto || null)
      setStudentProfile(savedProfile)
      setProfilePreview(savedPhoto || null)

      updateSessionUserFields({
        name: savedProfile.name || updatedName,
        photoURL: savedPhoto
      })

      setProfileSaveSuccess(true)

      setTimeout(() => {
        setShowProfileModal(false)
        setProfileSaveSuccess(false)
        setProfileForm({ name: savedProfile.name || studentName, pic: null, removePhoto: false })
        setProfilePreview(savedPhoto || null)
        originalStudentPicRef.current = savedPhoto || null
      }, 1500)
    } catch (error) {
      console.error('Failed to save student profile', error)
      let errorMessage = 'Unable to save profile changes right now. Please try again.'
      
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

  const displayUnreadCount = (() => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return unreadNotificationCount
    }
    const calculatedUnread = notifications.filter(n => {
      const readValue = n.read
      return readValue === false || readValue === 0 || readValue === '0' || readValue === null || readValue === undefined
    }).length
    return calculatedUnread
  })()

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#000000]' : 'bg-white'}`}>
      {/* Header */}
      <header className={`glass shadow-xl border-b sticky top-0 z-40 ${
        isDarkMode ? 'bg-[#1a1a1a] border-slate-700' : 'border-white/20'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-start sm:items-center py-3 sm:py-4 md:py-6 gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-shrink">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadowLg overflow-hidden flex-shrink-0">
                <img src="/assets/logos/um logo.png" alt="UM Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold textGrad">Student iTrack</h1>
                <p className={`text-[10px] sm:text-xs md:text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Smart Academic Monitoring System</p>
              </div>
            </div>
            
            <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 flex-shrink-0 ml-auto pt-0.5 sm:pt-0">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    const willOpen = !showNotifDropdown
                    setShowNotifDropdown(willOpen)
                    setShowProfileDropdown(false)
                    
                    if (willOpen && displayUnreadCount > 0 && (!Array.isArray(notifications) || notifications.length === 0)) {
                      setTimeout(() => refreshNotifications(), 100)
                    }
                  }}
                  className={`icon-button relative p-2 sm:p-2.5 rounded-lg ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'}`}
                >
                  <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isDarkMode ? 'text-white hover:text-slate-200' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                  {displayUnreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center badge shadow-lg">
                      {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifDropdown && (() => {
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

                  const notificationsArray = Array.isArray(notifications) ? notifications : []
                  const unreadNotifications = notificationsArray.filter(n => {
                    const readValue = n.read
                    return readValue === false || readValue === 0 || readValue === '0' || readValue === null || readValue === undefined
                  })
                  
                  const isUrgent = (notification) => {
                    const title = notification.title || ''
                    const message = notification.message || ''
                    return title.includes('Due Soon') || message.includes('due soon') || message.includes('overdue')
                  }
                  
                  const getStudentAction = (notification) => {
                    const title = notification.title || ''
                    const message = notification.message || ''
                    
                    if (title.includes('Grade Posted') || message.includes('grade')) {
                      return { text: 'View Grade', action: () => {
                        setShowNotifDropdown(false)
                      }}
                    }
                    if (title.includes('Due Soon') || title.includes('Assignment')) {
                      return { text: 'View Assignment', action: () => {
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
                    <div className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 w-auto sm:w-96 md:w-[420px] max-w-[280px] sm:max-w-[420px] max-h-[calc(100vh-5rem)] sm:max-h-[600px] rounded-2xl shadow-2xl border-2 z-50 overflow-hidden flex flex-col ${
                      isDarkMode 
                        ? 'bg-[#1a1a1a] border-slate-700' 
                        : 'bg-white border-slate-200'
                    }`}>
                      {/* Enhanced Header with Red/Maroon Gradient */}
                      <div className={`p-2.5 sm:p-4 md:p-5 border-b-2 flex-shrink-0 ${
                        isDarkMode 
                          ? 'bg-gradient-to-br from-red-600 via-[#7A1315] to-red-800 border-slate-700' 
                          : 'border-slate-200 bg-gradient-to-br from-red-600 via-[#7A1315] to-red-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-white text-sm sm:text-lg md:text-xl flex items-center gap-1.5 sm:gap-2">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                              </svg>
                              <span className="truncate">Notifications</span>
                            </h3>
                            <p className="text-[10px] sm:text-xs text-red-100 mt-0.5 sm:mt-1 font-medium hidden sm:block">Academic Updates & Reminders</p>
                    </div>
                          <div className="flex items-center gap-2">
                            {/* Refresh button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                refreshNotifications()
                              }}
                              className={`p-1.5 rounded-lg transition-all ${
                                isDarkMode
                                  ? 'hover:bg-red-700/50 text-white'
                                  : 'hover:bg-white/20 text-white'
                              }`}
                              title="Refresh notifications"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            {(() => {
                              const totalCount = Array.isArray(notifications) ? notifications.length : 0
                              return totalCount > 0 && (
                                <div className={`backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border ${
                              isDarkMode 
                                ? 'bg-yellow-500/90 border-yellow-400' 
                                : 'bg-white/20 border-white/30'
                            }`}>
                                  <span className={`font-bold text-xs sm:text-sm ${
                                isDarkMode ? 'text-black' : 'text-white'
                                  }`}>{totalCount}</span>
                            </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Notifications List */}
                      <div className={`notification-scroll flex-1 min-h-0 overflow-y-auto max-h-[calc(100vh-20rem)] sm:max-h-[500px] ${
                        isDarkMode 
                          ? 'bg-[#1a1a1a]' 
                          : 'bg-gradient-to-b from-slate-50 to-white'
                      }`} style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDarkMode ? '#475569 #1a1a1a' : '#cbd5e1 #ffffff'
                      }}>
                      {(() => {
                        let notificationsArray = []
                        if (Array.isArray(notifications)) {
                          notificationsArray = notifications
                        } else if (notifications && typeof notifications === 'object') {
                          const keys = Object.keys(notifications)
                          
                          if (Array.isArray(notifications.data)) {
                            notificationsArray = notifications.data
                          } else if (Array.isArray(notifications.notifications)) {
                            notificationsArray = notifications.notifications
                          } else if (Array.isArray(notifications.items)) {
                            notificationsArray = notifications.items
                          } else {
                            for (const key of keys) {
                              if (Array.isArray(notifications[key])) {
                                notificationsArray = notifications[key]
                                break
                              }
                            }
                          }
                        }
                        
                        const hasNotifications = notificationsArray.length > 0
                        
                        
                        if (!hasNotifications && displayUnreadCount > 0 && studentMySQLId) {
                          console.warn('⚠️ MISMATCH: Badge shows', displayUnreadCount, 'unread but notifications array is empty!')
                          console.warn('💡 Click the refresh button (↻) to reload notifications')
                        }
                        
                        if (!hasNotifications && process.env.NODE_ENV === 'development') {
                          console.warn('⚠️ No notifications to display. State:', {
                            notifications,
                            isArray: Array.isArray(notifications),
                            length: notifications?.length,
                            unreadCount: displayUnreadCount,
                            studentMySQLId
                          })
                        }
                        
                        return !hasNotifications
                      })() ? (
                        <div className="p-8 sm:p-12 text-center">
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center ${
                            isDarkMode
                              ? 'bg-gradient-to-br from-red-900/30 to-rose-900/30'
                              : 'bg-gradient-to-br from-red-100 to-rose-100'
                          }`}>
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <p className={`text-sm sm:text-base font-medium ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-500'
                          }`}>No notifications yet</p>
                          <p className={`text-xs sm:text-sm mt-1 px-2 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-400'
                          }`}>You don't have any notification history at the moment.</p>
                        </div>
                      ) : (
                        <>
                          {unreadNotifications.length === 0 && (
                            <div className="px-4 pt-4 pb-2 text-xs font-medium text-slate-500 flex items-center gap-2">
                              <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>No unread notifications. Showing your history.</span>
                            </div>
                          )}
                          {(() => {
                            let notificationsToRender = notificationsArray.length > 0 ? notificationsArray : []
                            
                            if (notificationsToRender.length === 0) {
                              if (Array.isArray(notifications)) {
                                notificationsToRender = notifications
                              } else if (notifications && typeof notifications === 'object') {
                                const keys = Object.keys(notifications)
                                
                                if (Array.isArray(notifications.data)) {
                                  notificationsToRender = notifications.data
                                } else if (Array.isArray(notifications.notifications)) {
                                  notificationsToRender = notifications.notifications
                                } else if (Array.isArray(notifications.items)) {
                                  notificationsToRender = notifications.items
                                } else {
                                  for (const key of keys) {
                                    if (Array.isArray(notifications[key])) {
                                      notificationsToRender = notifications[key]
                                      break
                                    }
                                  }
                                }
                              }
                            }
                            console.log('Notifications rendering debug:', {
                              notificationsToRenderLength: notificationsToRender.length,
                              notificationsStateType: typeof notifications,
                              isArray: Array.isArray(notifications),
                              sample: notificationsToRender.slice(0, 2).map(n => ({ id: n.id, title: n.title }))
                            })
                            
                            const sortedNotifications = [...notificationsToRender].sort((a, b) => {
                              const aRead = a.read === true || a.read === 1 || a.read === '1'
                              const bRead = b.read === true || b.read === 1 || b.read === '1'
                              if (aRead !== bRead) {
                                return aRead ? 1 : -1
                              }
                              const aDate = new Date(a.created_at || a.createdAt || a.timestamp || 0)
                              const bDate = new Date(b.created_at || b.createdAt || b.timestamp || 0)
                              return bDate - aDate
                            })
                            
                            return sortedNotifications.map(notification => {
                            const urgent = isUrgent(notification)
                            const action = getStudentAction(notification)
                            const timestamp = formatTimestamp(
                              notification.created_at || notification.createdAt || notification.timestamp
                            )
                            
                            return (
                          <div
                            key={notification.id}
                                className={`relative m-2 sm:m-3 rounded-xl shadow-md border-2 transition-all duration-200 cursor-pointer group ${
                                  isDarkMode
                                    ? 'bg-[#1a1a1a]'
                                    : 'bg-white'
                                } ${
                                  urgent ? 'border-[#7A1315]' : isDarkMode ? 'border-slate-700' : 'border-slate-200'
                                } ${!notification.read ? 'shadow-lg' : 'hover:shadow-lg'}`}
                            onClick={() => {
                              markAsRead(notification.id).catch(err => {
                                console.error('Error marking notification as read:', err)
                              })
                              const updatedNotifications = notifications.map(n =>
                                n.id === notification.id ? { ...n, read: true } : n
                              )
                              setNotifications(updatedNotifications)
                              setUnreadNotificationCount(Math.max(0, unreadNotificationCount - 1))
                            }}
                          >
                                {/* Card Content - Compact, Self-Contained */}
                                <div className="p-2.5 sm:p-4">
                                  {/* Header - Bold title with delete button */}
                                  <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                      <h4 className={`text-xs sm:text-sm font-bold leading-tight ${
                                      isDarkMode
                                          ? urgent ? 'text-red-400' : 'text-white'
                                        : 'text-[#7A1315]'
                                    }`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                        <div className={`flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                          isDarkMode ? 'bg-red-400' : 'bg-[#7A1315]'
                                      }`}></div>
                                    )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNotification(notification.id).catch(err => {
                                          console.error('Error deleting notification:', err)
                                        })
                                        const updatedNotifications = notifications.filter(n => n.id !== notification.id)
                                        setNotifications(updatedNotifications)
                                        if (!notification.read) {
                                          setUnreadNotificationCount(Math.max(0, unreadNotificationCount - 1))
                                        }
                                      }}
                                      className={`ml-1 sm:ml-2 rounded-full p-0.5 sm:p-1 text-[10px] sm:text-xs font-bold ${
                                        isDarkMode
                                          ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                                          : 'text-slate-500 hover:text-red-700 hover:bg-red-50'
                                      }`}
                                      aria-label="Delete notification"
                                    >
                                      ✕
                                    </button>
                              </div>
                              
                                  {/* Body - Brief, Single-Sentence Statement */}
                                  <p className={`text-[11px] sm:text-xs leading-relaxed mb-2 sm:mb-3 ${
                                    isDarkMode ? 'text-white' : 'text-slate-700'
                                  }`}>
                                    {notification.message}
                                  </p>
                                  
                                  {/* Footer - Timestamp and Single Maroon Action Button */}
                                  <div className={`flex items-center justify-between pt-1.5 sm:pt-2 border-t ${
                                    isDarkMode ? 'border-slate-700' : 'border-slate-100'
                                  }`}>
                                    <p className={`text-[10px] sm:text-xs font-medium ${
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
                                          setUnreadNotificationCount(Math.max(0, unreadNotificationCount - 1))
                                          action.action()
                                        }}
                                        className="bg-[#7A1315] hover:bg-red-800 text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                      >
                                        {action.text}
                                      </button>
                                    )}
                              </div>
                            </div>
                          </div>
                            )
                            })
                          })()}
                        </>
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
                          markAllAsRead().catch(err => {
                            console.error('Error marking all notifications as read:', err)
                          })
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

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown)
                    setShowNotifDropdown(false)
                  }}
                  className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 rounded-xl sm:rounded-2xl border border-slate-200 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-maroon-500"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-red-800 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                    {studentPic && studentPic !== '/assets/images/trisha.jpg' ? (
                      <img src={studentPic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(studentName)
                    )}
                  </div>
                  <div className="text-left min-w-0 hidden sm:block">
                    <p className={`text-[10px] md:text-xs uppercase tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>Profile</p>
                    <p className={`text-xs md:text-sm font-semibold truncate max-w-[80px] md:max-w-none ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{studentName}</p>
                  </div>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 w-auto sm:w-56 max-w-[280px] sm:max-w-none rounded-xl shadow-2xl border-2 z-50 overflow-hidden ${
                    isDarkMode 
                      ? 'bg-[#1a1a1a] border-slate-700' 
                      : 'bg-white border-slate-200'
                  }`}>
                    {/* Profile Header */}
                    <div className={`p-4 border-b ${
                      isDarkMode ? 'border-slate-700' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-800 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {studentPic && studentPic !== '/assets/images/trisha.jpg' ? (
                            <img src={studentPic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getInitials(studentName)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{studentName}</p>
                          <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{studentEmail || 'Student'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileModal(true)
                          setShowProfileDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-slate-800/50 text-white' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium">Profile Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false)
                          handleLogoutClick()
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-red-900/30 text-red-400' 
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z" />
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-2 text-center">
              Confirm Logout
            </h2>
            <p className="text-sm text-slate-600 mb-6 text-center">
              Are you sure you want to logout?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#7A1315] hover:bg-[#8a1a1c] shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 fade">
        {/* Student Academic Summary Section with Welcome */}
        <div className={`rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 slide-up ${
          isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
        }`}>
          <div className="mb-2 sm:mb-3">
            <h2 className={`text-sm sm:text-base md:text-lg font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Welcome, <span className="text-[#7A1315] font-semibold">{studentName}</span>
            </h2>
          </div>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#7A1315]">Student Academic Summary</h2>
            <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Track assessments, attendance, and grades across all enrolled subjects.</p>
          </div>

          {/* Stats Cards - Using Real-Time Firestore Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {(() => {
            const stats = calculateRealTimeStatistics(data, liveGrades, liveAttendance)
            
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
                  className={`metric-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden border ${
                    isDarkMode 
                      ? 'bg-[#1a1a1a] border-slate-700' 
                      : 'bg-white/80 border-white/60'
                  }`}
                style={{ minHeight: '120px' }}
              >
                <div className="w-full h-full p-2 sm:p-3 md:p-5 box-border flex flex-col">
                    <div className={`metric-icon ${card.iconClass} mb-2 p-1.5 sm:p-2 rounded-lg w-fit`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d={card.iconPath} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      </div>
                    <p className={`text-xs sm:text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{card.label}</p>
                    <p className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 break-words ${isDarkMode ? 'text-white' : card.color}`}>{card.value}</p>
                    <p className={`text-[10px] sm:text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{card.description}</p>
                </div>
              </div>
            )
            })
          })()}
          </div>
        </div>

        {/* Subjects Section */}
        <div className={`rounded-xl shadow-sm p-4 sm:p-5 md:p-6 slide-up ${
          isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
        }`}>
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
              <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {filterTerm === 'all' ? 'All Subjects' : 
                 filterTerm === 'first' ? '1st Term Subjects' : 
                 filterTerm === 'second' ? '2nd Term Subjects' : 
                 'Archived Subjects'}
              </h2>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {/* Search Input */}
                <div className="relative flex-1 sm:min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-3 py-2 pl-9 rounded-lg border text-sm ${
                      isDarkMode 
                        ? 'bg-[#2c2c2c] border-slate-600 text-white placeholder-slate-400' 
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                    } focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:border-transparent`}
                  />
                  <i className={`fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}></i>
          </div>
          
                {/* Sort Dropdown */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-')
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode 
                      ? 'bg-[#2c2c2c] border-slate-600 text-white' 
                      : 'bg-white border-slate-300 text-slate-800'
                  } focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:border-transparent`}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="code-asc">Code (A-Z)</option>
                  <option value="code-desc">Code (Z-A)</option>
                  <option value="grade-desc">Grade (High to Low)</option>
                  <option value="grade-asc">Grade (Low to High)</option>
                  <option value="attendance-desc">Attendance (High to Low)</option>
                  <option value="attendance-asc">Attendance (Low to High)</option>
                </select>
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTerm('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterTerm === 'all'
                      ? isDarkMode
                        ? 'bg-[#7A1315] text-white shadow-lg'
                        : 'bg-[#7A1315] text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c] hover:border-slate-500'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 hover:border-slate-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTerm('first')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterTerm === 'first'
                      ? isDarkMode
                        ? 'bg-[#7A1315] text-white shadow-lg'
                        : 'bg-[#7A1315] text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c] hover:border-slate-500'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 hover:border-slate-400'
                  }`}
                >
                  1st Term
                </button>
                <button
                  onClick={() => setFilterTerm('second')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterTerm === 'second'
                      ? isDarkMode
                        ? 'bg-[#7A1315] text-white shadow-lg'
                        : 'bg-[#7A1315] text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c] hover:border-slate-500'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 hover:border-slate-400'
                  }`}
                >
                  2nd Term
                </button>
              </div>
              
              {/* Separator */}
              <div className={`h-6 w-px ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
              
              {/* Archived Button - More Prominent */}
              {(() => {
                const allSubjects = [
                  ...(data.firstTerm || []).map(s => ({ ...s, term: 'first' })),
                  ...(data.secondTerm || []).map(s => ({ ...s, term: 'second' }))
                ]
                const archivedCount = allSubjects.filter(s => isSubjectArchived(s)).length
                
                return (
                  <button
                    onClick={() => setFilterTerm('archived')}
                    disabled={archivedCount === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      filterTerm === 'archived'
                        ? isDarkMode
                          ? 'bg-amber-700 text-white shadow-lg border-2 border-amber-600'
                          : 'bg-amber-600 text-white shadow-lg border-2 border-amber-500'
                        : archivedCount === 0
                          ? isDarkMode
                            ? 'bg-[#2c2c2c] text-slate-600 border border-slate-600 cursor-not-allowed opacity-50'
                            : 'bg-slate-100 text-slate-400 border border-slate-300 cursor-not-allowed opacity-50'
                          : isDarkMode
                            ? 'bg-amber-900/30 text-amber-300 border border-amber-700 hover:bg-amber-900/50 hover:border-amber-600'
                            : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                    }`}
                    title={archivedCount === 0 ? 'No archived subjects yet' : `View ${archivedCount} archived subject${archivedCount !== 1 ? 's' : ''}`}
                  >
                    <i className={`fa-solid fa-archive ${filterTerm === 'archived' ? 'text-white' : ''}`}></i>
                    <span>Archived</span>
                    {archivedCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        filterTerm === 'archived'
                          ? 'bg-white/20 text-white'
                          : isDarkMode
                            ? 'bg-amber-700 text-amber-200'
                            : 'bg-amber-600 text-white'
                      }`}>
                        {archivedCount}
                      </span>
                    )}
                  </button>
                )
              })()}
            </div>
            
            {/* Archive Notice Banner */}
            {filterTerm === 'archived' && (() => {
              const allSubjects = [
                ...(data.firstTerm || []).map(s => ({ ...s, term: 'first' })),
                ...(data.secondTerm || []).map(s => ({ ...s, term: 'second' }))
              ]
              const archivedCount = allSubjects.filter(s => isSubjectArchived(s)).length
              
              if (archivedCount > 0) {
                return (
                  <div className={`mb-4 p-3 sm:p-4 rounded-lg border ${
                    isDarkMode
                      ? 'bg-amber-900/20 border-amber-700/50'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-amber-800/50' : 'bg-amber-100'
                      }`}>
                        <i className={`fa-solid fa-info-circle text-sm ${
                          isDarkMode ? 'text-amber-400' : 'text-amber-600'
                        }`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm mb-1 ${
                          isDarkMode ? 'text-amber-300' : 'text-amber-800'
                        }`}>
                          Viewing Archived Subjects
                        </h4>
                        <p className={`text-xs sm:text-sm ${
                          isDarkMode ? 'text-amber-200/80' : 'text-amber-700'
                        }`}>
                          These subjects have no activity for over 1 year. They are kept for historical records but are hidden from your main view by default.
                        </p>
                      </div>
                      <button
                        onClick={() => setFilterTerm('all')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isDarkMode
                            ? 'bg-amber-800/50 text-amber-300 hover:bg-amber-800/70 border border-amber-700'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                        }`}
                      >
                        View Current
                      </button>
                    </div>
                  </div>
                )
              }
              return null
            })()}
          </div>
          
          {(() => {
            const allSubjects = [
              ...(data.firstTerm || []).map(s => ({ ...s, term: 'first' })),
              ...(data.secondTerm || []).map(s => ({ ...s, term: 'second' }))
            ]
            
            const filteredSorted = getFilteredAndSortedSubjects(allSubjects)
            const paginated = getPaginatedSubjects(filteredSorted)
            const totalPages = Math.ceil(filteredSorted.length / itemsPerPage)
            
            return (
              <>
                {filteredSorted.length > 0 ? (
                  <>
                    <div className="mb-3 text-sm text-slate-500">
                      Showing {paginated.length} of {filteredSorted.length} subject{filteredSorted.length !== 1 ? 's' : ''}
                    </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                      {paginated.map((subject, index) => {
                        const isArchived = isSubjectArchived(subject)
                        return (
              <div
                  key={subject.id || subject.code || index}
                onClick={() => openSubjectModal(subject, subject.term || 'first')}
                className={`subject-card p-4 sm:p-5 rounded-xl border cursor-pointer transition-all slide-up relative ${
                  isDarkMode 
                    ? isArchived
                      ? 'bg-[#2c2c2c] border-slate-600 hover:border-slate-500 opacity-75'
                      : 'bg-[#1a1a1a] border-slate-700 hover:border-slate-600'
                    : isArchived
                      ? 'bg-slate-50 border-slate-300 hover:border-slate-400 opacity-75'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {isArchived && (
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-amber-900/50 text-amber-300 border border-amber-700'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    <i className="fa-solid fa-archive mr-1"></i> Archived
                  </div>
                )}
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'} break-words`}>{subject.id || subject.code} - {subject.name}</h3>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Code: {subject.code} | {subject.term === 'second' ? '2nd' : '1st'} Term</p>
                    {/* Professor Info */}
                    {subject.instructor && subject.instructor.name && subject.instructor.name !== 'TBA' && (
                      <div className="flex items-center mt-2 gap-2">
                        {subject.instructor.photo_url ? (
                          <img 
                            src={subject.instructor.photo_url} 
                            alt={subject.instructor.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              const img = e.target
                              img.style.display = 'none'
                              const parent = img.parentElement
                              if (parent && !parent.querySelector('.prof-initials')) {
                                const initialsSpan = document.createElement('span')
                                initialsSpan.className = 'prof-initials w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-[#7A1315] flex items-center justify-center text-white text-xs font-semibold'
                                initialsSpan.textContent = getInitials(subject.instructor.name)
                                parent.appendChild(initialsSpan)
                              }
                            }}
                          />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-[#7A1315] flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(subject.instructor.name)}
                          </span>
                        )}
                        <span className="text-xs text-slate-600 font-medium truncate">
                          Prof. {subject.instructor.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className={`text-lg sm:text-xl font-bold ${getGradeColor(subject.grade)}`}>
                      {subject.grade || "N/A"}%
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500">Current</p>
                  </div>
                </div>
                
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3 sm:mb-4">
                  <div className={`h-full ${getGradeBg(subject.grade)} progress`} style={{ width: `${subject.grade || 0}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center min-w-0">
                    <span className="text-[10px] sm:text-xs text-slate-500 mr-1 sm:mr-2">Attendance:</span>
                    <span className={`text-[10px] sm:text-xs font-medium ${
                      subject.attRate >= 90 ? "text-emerald-600" :
                      subject.attRate >= 80 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {subject.attRate || "N/A"}%
                    </span>
                  </div>
                  <button className="text-xs text-slate-500 hover:text-slate-700 flex-shrink-0">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
                        )
                      })}
          </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t ${
                        isDarkMode ? 'border-slate-700' : 'border-slate-200'
                      }`}>
                        <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === 1
                                ? isDarkMode
                                  ? 'bg-[#2c2c2c] text-slate-600 cursor-not-allowed'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : isDarkMode
                                  ? 'bg-[#2c2c2c] text-white border border-slate-600 hover:bg-[#3c3c3c]'
                                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <i className="fa-solid fa-chevron-left mr-1"></i> Previous
                          </button>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === totalPages
                                ? isDarkMode
                                  ? 'bg-[#2c2c2c] text-slate-600 cursor-not-allowed'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : isDarkMode
                                  ? 'bg-[#2c2c2c] text-white border border-slate-600 hover:bg-[#3c3c3c]'
                                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            Next <i className="fa-solid fa-chevron-right ml-1"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
          ) : (
            <div className="text-center py-12">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
                    }`}>
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {searchQuery ? 'No subjects found' : 'Not Enrolled in Any Subjects'}
                    </h3>
                    <p className={`text-sm max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {searchQuery 
                        ? `No subjects match "${searchQuery}". Try adjusting your search or filters.`
                        : 'You are not currently enrolled in any subjects. Please contact your professor to be enrolled in subjects.'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setFilterTerm('all')
                        }}
                        className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode
                            ? 'bg-[#7A1315] text-white hover:bg-[#8a2325]'
                            : 'bg-[#7A1315] text-white hover:bg-[#8a2325]'
                        }`}
                      >
                        Clear Filters
                      </button>
                    )}
            </div>
          )}
              </>
            )
          })()}
        </div>
      </main>

      {/* Subject Detail Modal */}
      {showModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50" onClick={closeModal}>
          <div className={`rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scroll shadow-2xl modal-appear ${
            isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`modal-sticky-header mb-4 sm:mb-6 pb-3 sm:pb-4 pt-3 sm:pt-4 border-b shadow-sm ${
              isDarkMode ? 'bg-[#1a1a1a] border-slate-700' : 'border-slate-200'
            }`}>
              <div className="flex justify-between items-start sm:items-center gap-2">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className={`text-base sm:text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} break-words`}>{selectedSubject.id} - {selectedSubject.name}</h3>
                  <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'} break-words`}>Subject Code: {selectedSubject.code} | {selectedSubject.term === 'first' ? '1st' : '2nd'} Term Subject</p>
                </div>
                <button onClick={closeModal} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-colors rounded-full border shadow-md flex-shrink-0 ${
                  isDarkMode 
                    ? 'text-white hover:text-slate-200 bg-[#1a1a1a] border-slate-600 hover:bg-[#2c2c2c] hover:border-slate-500' 
                    : 'text-slate-600 hover:text-slate-800 bg-white border-slate-200 hover:bg-slate-100'
                }`}>
                  <i className="fa-solid fa-xmark text-base sm:text-lg"></i>
                </button>
              </div>
            </div>
            
            {/* Modal content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div className="md:col-span-2 space-y-4 sm:space-y-5">
                <div className={`p-5 rounded-xl border ${
                  isDarkMode ? 'bg-[#1a1a1a] border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Grade Performance</h4>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Your current grade for this subject</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                      }`}>
                        <i className={`fa-solid fa-graduation-cap ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}></i>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Grade</span>
                        <span className={`text-2xl font-bold ${getGradeColor(selectedSubject.grade)}`}>
                          {selectedSubject.grade || "N/A"}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-full rounded-full h-2 overflow-hidden ${
                    isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                  }`}>
                    <div className={`h-full ${getGradeBg(selectedSubject.grade)} progress grade-progress`} style={{ width: `${selectedSubject.grade || 0}%` }}></div>
                  </div>
                </div>

                {/* Exams/Grades Table with Dates - Improved Layout */}
                {selectedSubject.exams && selectedSubject.exams.length > 0 && (() => {
                  let filteredExams = selectedSubject.exams.filter(exam => {
                    if (examViewMode === 'all') return true
                    const examType = (exam.type || '').toLowerCase()
                    return examType === examViewMode.toLowerCase()
                  })
                  
                  if (examSearchQuery) {
                    const searchLower = examSearchQuery.toLowerCase()
                    filteredExams = filteredExams.filter(exam => {
                      const name = (exam.name || '').toLowerCase()
                      const type = (exam.type || '').toLowerCase()
                      return name.includes(searchLower) || type.includes(searchLower)
                    })
                  }
                  
                  filteredExams.sort((a, b) => {
                    let aValue, bValue
                    switch (examSortBy) {
                      case 'date':
                        aValue = a.date ? new Date(a.date).getTime() : 0
                        bValue = b.date ? new Date(b.date).getTime() : 0
                        break
                      case 'name':
                        aValue = (a.name || '').toLowerCase()
                        bValue = (b.name || '').toLowerCase()
                        break
                      case 'score':
                        aValue = a.score !== undefined ? (a.score / (a.maxPoints || 100)) : 0
                        bValue = b.score !== undefined ? (b.score / (b.maxPoints || 100)) : 0
                        break
                      case 'type':
                        aValue = (a.type || '').toLowerCase()
                        bValue = (b.type || '').toLowerCase()
                        break
                      default:
                        aValue = a.date ? new Date(a.date).getTime() : 0
                        bValue = b.date ? new Date(b.date).getTime() : 0
                    }
                    
                    if (examSortOrder === 'asc') {
                      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
                    } else {
                      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
                    }
                  })
                  
                  const examsByType = {}
                  filteredExams.forEach(exam => {
                    const type = exam.type || 'Other'
                    if (!examsByType[type]) {
                      examsByType[type] = []
                    }
                    examsByType[type].push(exam)
                  })
                  
                  const startIndex = (examPage - 1) * examItemsPerPage
                  const endIndex = startIndex + examItemsPerPage
                  const paginatedExams = filteredExams.slice(startIndex, endIndex)
                  const totalExamPages = Math.ceil(filteredExams.length / examItemsPerPage)
                  
                  const examTypeCounts = {}
                  selectedSubject.exams.forEach(exam => {
                    const type = exam.type || 'Other'
                    examTypeCounts[type] = (examTypeCounts[type] || 0) + 1
                  })
                  
                  return (
                  <div className={`p-4 sm:p-5 rounded-xl border ${
                    isDarkMode ? 'bg-[#1a1a1a] border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h4 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Exams & Grades ({filteredExams.length})
                      </h4>
                      
                      {/* Exam Controls */}
                      <div className="flex flex-wrap gap-2">
                        {/* Search */}
                        <div className="relative flex-1 sm:min-w-[150px]">
                          <input
                            type="text"
                            placeholder="Search exams..."
                            value={examSearchQuery}
                            onChange={(e) => {
                              setExamSearchQuery(e.target.value)
                              setExamPage(1)
                            }}
                            className={`w-full px-2 py-1.5 pl-7 rounded-lg border text-xs ${
                              isDarkMode 
                                ? 'bg-[#2c2c2c] border-slate-600 text-white placeholder-slate-400' 
                                : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                            } focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:border-transparent`}
                          />
                          <i className={`fa-solid fa-search absolute left-2 top-1/2 transform -translate-y-1/2 text-xs ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}></i>
                        </div>
                        
                        {/* Sort */}
                        <select
                          value={`${examSortBy}-${examSortOrder}`}
                          onChange={(e) => {
                            const [newSortBy, newSortOrder] = e.target.value.split('-')
                            setExamSortBy(newSortBy)
                            setExamSortOrder(newSortOrder)
                            setExamPage(1)
                          }}
                          className={`px-2 py-1.5 rounded-lg border text-xs ${
                            isDarkMode 
                              ? 'bg-[#2c2c2c] border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-800'
                          } focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:border-transparent`}
                        >
                          <option value="date-desc">Date (Newest)</option>
                          <option value="date-asc">Date (Oldest)</option>
                          <option value="name-asc">Name (A-Z)</option>
                          <option value="name-desc">Name (Z-A)</option>
                          <option value="score-desc">Score (High-Low)</option>
                          <option value="score-asc">Score (Low-High)</option>
                          <option value="type-asc">Type (A-Z)</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Exam Type Filter Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => {
                          setExamViewMode('all')
                          setExamPage(1)
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          examViewMode === 'all'
                            ? isDarkMode
                              ? 'bg-[#7A1315] text-white'
                              : 'bg-[#7A1315] text-white'
                            : isDarkMode
                              ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c]'
                              : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        All ({selectedSubject.exams.length})
                      </button>
                      {Object.keys(examTypeCounts).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setExamViewMode(type.toLowerCase())
                            setExamPage(1)
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            examViewMode === type.toLowerCase()
                              ? isDarkMode
                                ? 'bg-[#7A1315] text-white'
                                : 'bg-[#7A1315] text-white'
                              : isDarkMode
                                ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c]'
                                : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {type} ({examTypeCounts[type]})
                        </button>
                      ))}
                    </div>
                    
                    {/* Grouped Exams by Type */}
                    <div className="space-y-3">
                      {Object.keys(examsByType).map(type => {
                        const typeExams = examsByType[type]
                        const isExpanded = expandedExamTypes[type] !== false
                        const displayExams = isExpanded ? typeExams : typeExams.slice(0, 3)
                        const hasMore = typeExams.length > 3
                        
                        return (
                          <div key={type} className={`rounded-lg border overflow-hidden ${
                            isDarkMode ? 'bg-[#1a1a1a] border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            {/* Type Header - Collapsible */}
                            <button
                              onClick={() => setExpandedExamTypes(prev => ({
                                ...prev,
                                [type]: !isExpanded
                              }))}
                              className={`w-full flex items-center justify-between p-3 ${
                                isDarkMode 
                                  ? 'bg-slate-800/50 hover:bg-slate-800/70' 
                                  : 'bg-slate-100 hover:bg-slate-200'
                              } transition-colors`}
                            >
                              <div className="flex items-center gap-2">
                                <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'} text-xs ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                }`}></i>
                                <span className={`font-semibold text-sm ${
                                  isDarkMode ? 'text-white' : 'text-slate-800'
                                }`}>
                                  {type} ({typeExams.length})
                                </span>
                              </div>
                              {hasMore && !isExpanded && (
                                <span className={`text-xs ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  +{typeExams.length - 3} more
                                </span>
                              )}
                            </button>
                            
                            {/* Exams List */}
                            {isExpanded && (
                              <div className="p-3 space-y-2">
                                {displayExams.map((exam, index) => {
                        const examDate = exam.date ? (() => {
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
                        })() : 'N/A'
                        
                        return (
                          <div
                            key={index}
                                      className={`p-3 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-[#1a1a1a] border-slate-700' 
                                          : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                                      <div className="mb-2">
                                        <h5 className={`font-bold text-sm mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                {exam.name}
                              </h5>
                            </div>
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className={`flex flex-col items-center p-2 rounded-lg border ${
                                isDarkMode 
                                  ? 'bg-slate-800/30 border-slate-700' 
                                            : 'bg-white border-slate-200'
                                        }`}>
                                          <i className={`fa-solid fa-file-lines text-xs mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}></i>
                                          <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Score</span>
                                          <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                  {exam.score !== undefined ? `${exam.score}/${exam.maxPoints || 100}` : 'N/A'}
                                </span>
                              </div>
                                        <div className={`flex flex-col items-center p-2 rounded-lg border ${
                                exam.status === 'Taken'
                                  ? isDarkMode 
                                    ? 'bg-emerald-900/30 border-emerald-700' 
                                    : 'bg-emerald-50 border-emerald-100'
                                  : isDarkMode
                                    ? 'bg-red-900/30 border-red-700'
                                    : 'bg-red-50 border-red-100'
                              }`}>
                                          <i className={`fa-solid ${exam.status === 'Taken' ? 'fa-check-circle' : 'fa-times-circle'} text-xs mb-1 ${
                                    exam.status === 'Taken'
                                      ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                                      : isDarkMode ? 'text-red-400' : 'text-red-600'
                                  }`}></i>
                                          <span className={`text-xs font-medium mb-0.5 ${
                                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                  }`}>Status</span>
                                          <span className={`text-xs font-semibold ${
                                  exam.status === 'Taken' 
                                              ? isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                                              : isDarkMode ? 'text-red-300' : 'text-red-700'
                                }`}>
                                  {exam.status}
                                </span>
                              </div>
                                        <div className={`flex flex-col items-center p-2 rounded-lg border ${
                                isDarkMode 
                                  ? 'bg-slate-800/30 border-slate-700' 
                                            : 'bg-white border-slate-200'
                                        }`}>
                                          <i className={`fa-solid fa-calendar text-xs mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}></i>
                                          <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Date</span>
                                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                  {examDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Pagination for Exams */}
                    {totalExamPages > 1 && (
                      <div className={`flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 pt-4 border-t ${
                        isDarkMode ? 'border-slate-700' : 'border-slate-200'
                      }`}>
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Showing {paginatedExams.length} of {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExamPage(prev => Math.max(1, prev - 1))}
                            disabled={examPage === 1}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                              examPage === 1
                                ? isDarkMode
                                  ? 'bg-[#2c2c2c] text-slate-600 cursor-not-allowed opacity-50'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                : isDarkMode
                                  ? 'bg-[#2c2c2c] text-white border border-slate-600 hover:bg-[#3c3c3c]'
                                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <i className="fa-solid fa-chevron-left mr-1"></i> Prev
                          </button>
                          <span className={`px-2 py-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Page {examPage} of {totalExamPages}
                          </span>
                          <button
                            onClick={() => setExamPage(prev => Math.min(totalExamPages, prev + 1))}
                            disabled={examPage === totalExamPages}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                              examPage === totalExamPages
                                ? isDarkMode
                                  ? 'bg-[#2c2c2c] text-slate-600 cursor-not-allowed opacity-50'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                : isDarkMode
                                  ? 'bg-[#2c2c2c] text-white border border-slate-600 hover:bg-[#3c3c3c]'
                                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            Next <i className="fa-solid fa-chevron-right ml-1"></i>
                          </button>
                    </div>
                  </div>
                )}
                  </div>
                  )
                })()}
              </div>
              
              <div className="md:col-span-1 space-y-4 sm:space-y-5">
                <div className={`p-4 sm:p-5 rounded-xl border ${
                  isDarkMode ? 'bg-[#1a1a1a] border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Attendance Summary</h4>
                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    <div className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-emerald-900/30 border-emerald-700' 
                        : 'bg-emerald-50 border-emerald-100'
                    }`}>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <i className={`fa-solid fa-check-circle text-sm sm:text-base ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}></i>
                        <span className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Attendance Rate</span>
                      </div>
                      <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{selectedSubject.attRate || "N/A"}%</span>
                    </div>
                    <div className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-red-900/30 border-red-700' 
                        : 'bg-red-50 border-red-100'
                    }`}>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <i className={`fa-solid fa-user-slash text-sm sm:text-base ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}></i>
                        <span className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Absences</span>
                      </div>
                      <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{selectedSubject.abs || "N/A"}</span>
                    </div>
                  </div>

                  {/* Attendance Records with Dates */}
                  {selectedSubject.attendanceRecords && selectedSubject.attendanceRecords.length > 0 && (
                    <div className="mt-4">
                      <h5 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Attendance Records</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedSubject.attendanceRecords.map((record, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                              record.status === 'present' 
                                ? isDarkMode
                                  ? 'bg-emerald-900/30 border-emerald-700'
                                  : 'bg-emerald-50 border-emerald-100'
                                : isDarkMode
                                  ? 'bg-red-900/30 border-red-700'
                                  : 'bg-red-50 border-red-100'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <i className={`fa-solid ${record.status === 'present' 
                                ? isDarkMode 
                                  ? 'fa-check-circle text-emerald-400' 
                                  : 'fa-check-circle text-emerald-600'
                                : isDarkMode
                                  ? 'fa-user-slash text-red-400'
                                  : 'fa-user-slash text-red-600'
                              }`}></i>
                              <span className={`font-medium capitalize ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{record.status}</span>
                </div>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setProfileSaveSuccess(false)
          setProfileSection('account')
        }}
        studentName={studentName}
        studentPic={studentPic}
        studentEmail={studentEmail}
        studentUid={studentUid}
        studentProfile={studentProfile}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        profilePreview={profilePreview}
        setProfilePreview={setProfilePreview}
        profileSaveSuccess={profileSaveSuccess}
        setProfileSaveSuccess={setProfileSaveSuccess}
        profileSaveError={profileSaveError}
        setProfileSaveError={setProfileSaveError}
        profileSection={profileSection}
        setProfileSection={setProfileSection}
        originalStudentPicRef={originalStudentPicRef}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
}

export default Student

