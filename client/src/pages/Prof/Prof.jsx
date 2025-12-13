 import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import './Prof.css'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, auth, onAuthStateChanged as watchAuthState, signOutUser } from '../../firebase'
import { getWithBackup, setWithBackup } from '../../services/firestoreWithBackup'
import { getProfessorByUid, setProfessor } from '../../services/professors'
import { getStudentByEmail, getStudentByNumericalId, setStudent, addStudent, listStudents } from '../../services/students'
import {
  syncStudentGrade,
  syncStudentAttendance,
  syncStudentSubjects,
  getStudentDashboard,
} from '../../services/studentDashboards'
import { getCourseByCode, createCourse, getCoursesByProfessor, deleteCourse, updateCourse } from '../../services/courses'
import { createEnrollment, getEnrollmentByStudentAndCourse, subscribeToCourseEnrollments, getEnrollmentsByCourse, deleteEnrollmentByStudentAndCourse, deleteEnrollment } from '../../services/enrollments'
import { createGrade } from '../../services/grades'
import { setAttendanceForDate } from '../../services/attendance'
import { subscribeToProfessorDashboard, detectDateChanges } from '../../services/realtimeSync'
import { generateStudentEmail, isValidNumericalStudentId } from '../../utils/studentIdHelpers'
import { getStudentUidForSync, verifyStudentIdEmailPair } from '../../utils/studentVerification'
import { migrateDashboardData, migrateStudents, migrateEnrollments, migrateRecords, migrateGrades } from '../../utils/migrations/studentIdMigration'
import { markAllAsRead } from '../../services/notifications'
import { getDefaultAvatar } from '../../utils/avatarGenerator'
import subjectIcon from './subject-icon.png'
import { normalizeStudentId, normalizeEnrollsMap, validateStudentId, validateStudentForm, validateSubjectForm, isValidEmailFormat, detectEmailType } from '../../utils/validationHelpers'
import { findStudentById } from '../../utils/studentHelpers'
import { addAlert, ALERT_MESSAGES } from '../../utils/alertHelpers'
import { getCurrentUserUid, getCurrentUserData, updateSessionUserFields } from '../../utils/authHelpers'
import {
  USER_ROLES,
  ASSESSMENT_TYPES,
  ATTENDANCE_STATUS,
  TERMS,
  DASHBOARD_COLLECTION,
  COLLECTIONS,
  STORAGE_KEYS,
  TIME_CONSTANTS,
  UI_CONSTANTS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MODAL_TYPES,
  TAB_NAMES
} from '../../constants/appConstants'

import { useSubjects } from '../../hooks/useSubjects'
import { useStudents } from '../../hooks/useStudents'
import { useEnrollments } from '../../hooks/useEnrollments'
import { useGrades } from '../../hooks/useGrades'
import { useAttendance } from '../../hooks/useAttendance'
import { useProfessorData } from '../../hooks/useProfessorData'
import { useCSVImport } from '../../hooks/useCSVImport'
import { useNotifications } from '../../hooks/useNotifications'
import { useQuickGrade } from '../../hooks/useQuickGrade'
import { useSubjectManagement } from '../../hooks/useSubjectManagement'
import { useModals } from '../../hooks/useModal'
import { useDataFetching } from '../../hooks/useDataFetching'
import { useThemeManagement } from '../../hooks/useThemeManagement'
import { useProfUIState } from '../../hooks/useProfUIState'
import { useProfUtilities, StudentAvatar as ProfStudentAvatar } from '../../hooks/useProfUtilities'
import { useProfDataSaving } from '../../hooks/useProfDataSaving'
import SubjectsTab from './components/SubjectsTab'
import AttendanceTab from './components/AttendanceTab'
import GradesTab from './components/GradesTab'
import StudentsTab from './components/StudentsTab'
import StudentAvatar from '../../components/StudentAvatar/StudentAvatar'
import AddSubjectModal from './components/AddSubjectModal'
import ProfileModal from './components/ProfileModal'
import AddStudentModal from './components/AddStudentModal'

function Prof() {
  const navigate = useNavigate()
  const location = useLocation()
  const [blocked, setBlocked] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  const authUser = auth.currentUser
  
  const emailCheck = useMemo(() => {
    if (!authUser || !authUser.email) {
      console.error('🚫 Prof.jsx: No auth user or email')
      return { valid: false, reason: 'No auth user or email' }
    }
    
    const emailType = detectEmailType(authUser.email)
    console.log('🔐🔐🔐 Prof.jsx RENDER CHECK (EVERY RENDER):', {
      email: authUser.email,
      emailType,
      timestamp: new Date().toISOString(),
      renderCount: 'checking...'
    })
    
    if (emailType !== 'professor') {
      console.error('🚫🚫🚫🚫🚫🚫🚫 RENDER-TIME BLOCK: Student email detected - IMMEDIATE BLOCK', {
        email: authUser.email,
        emailType,
        timestamp: new Date().toISOString(),
        action: 'SIGNING OUT AND REDIRECTING'
      })
      signOutUser().then(() => {
        sessionStorage.removeItem('currentUser')
        localStorage.removeItem('currentUser')
        setBlocked(true)
        setIsChecking(false)
      }).catch(err => {
        console.error('Sign out error:', err)
        setBlocked(true)
        setIsChecking(false)
      })
      return { valid: false, reason: 'Student email detected', emailType }
    }
    
    const userData = getCurrentUserData()
    if (userData) {
      if (userData.type !== 'Professor') {
        console.error('🚫🚫🚫 Prof.jsx: User data type mismatch', {
          userDataType: userData.type,
          email: authUser.email,
          emailType
        })
        signOutUser().then(() => {
          sessionStorage.removeItem('currentUser')
          localStorage.removeItem('currentUser')
          setBlocked(true)
          setIsChecking(false)
        })
        return { valid: false, reason: 'User data type mismatch' }
      }
      
      if (userData.email) {
        const userDataEmailType = detectEmailType(userData.email)
        if (userDataEmailType !== 'professor') {
          console.error('🚫🚫🚫 Prof.jsx: User data email type mismatch', {
            userDataEmail: userData.email,
            userDataEmailType,
            authEmail: authUser.email,
            authEmailType: emailType
          })
          signOutUser().then(() => {
            sessionStorage.removeItem('currentUser')
            localStorage.removeItem('currentUser')
            setBlocked(true)
            setIsChecking(false)
          })
          return { valid: false, reason: 'User data email type mismatch' }
        }
      }
    }
    
    return { valid: true }
  }, [authUser?.email, authUser?.uid])
  
  if (!emailCheck.valid || blocked) {
    if (isChecking && !blocked) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>Verifying access...</div>
        </div>
      )
    }
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userData = getCurrentUserData()
        if (!userData) {
          console.warn('No user data found, redirecting to login')
          navigate('/login', { replace: true })
          return
        }

        if (userData.type !== 'Professor') {
          console.error('🚫 CRITICAL: Non-professor user attempting to access professor dashboard')
          const { signOutUser } = await import('../../firebase')
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          navigate('/login', { replace: true })
          return
        }

        const authUser = auth.currentUser
        if (!authUser) {
          console.warn('No authenticated user, redirecting to login')
          sessionStorage.removeItem('currentUser')
          navigate('/login', { replace: true })
          return
        }

        if (authUser.email) {
          const emailType = detectEmailType(authUser.email)
          if (emailType !== 'professor') {
            console.error('🚫 CRITICAL: Student email detected in professor dashboard - IMMEDIATE BLOCK')
            const { signOutUser } = await import('../../firebase')
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            navigate('/login', { replace: true })
            return
          }
        } else {
          console.error('🚫 CRITICAL: No email found for authenticated user')
          const { signOutUser } = await import('../../firebase')
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          navigate('/login', { replace: true })
          return
        }

        if (userData.email) {
          const emailType = detectEmailType(userData.email)
          if (emailType !== 'professor') {
            console.error('🚫 CRITICAL: Student email in user data - IMMEDIATE BLOCK')
            const { signOutUser } = await import('../../firebase')
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            navigate('/login', { replace: true })
            return
          }
        }
      } catch (error) {
        console.error('Error checking access:', error)
        const { signOutUser } = await import('../../firebase')
        await signOutUser()
        sessionStorage.removeItem('currentUser')
        navigate('/login', { replace: true })
      }
    }

    checkAccess()

    const authUnsubscribe = watchAuthState(async (user) => {
      if (!user) {
        sessionStorage.removeItem('currentUser')
        navigate('/login', { replace: true })
        return
      }

      if (user.email) {
        const emailType = detectEmailType(user.email)
        console.log('🔐 Prof.jsx: Auth state change check', {
          email: user.email,
          emailType
        })
        if (emailType !== 'professor') {
          console.error('🚫🚫🚫 CRITICAL: Auth state change detected student email - IMMEDIATE BLOCK', {
            email: user.email,
            emailType
          })
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          navigate('/login', { replace: true })
          return
        }
      } else {
        console.error('🚫🚫🚫 CRITICAL: Auth state change - no email found')
        await signOutUser()
        sessionStorage.removeItem('currentUser')
        navigate('/login', { replace: true })
        return
      }
    })

    const intervalId = setInterval(() => {
      checkAccess()
    }, 5000)

    return () => {
      authUnsubscribe()
      clearInterval(intervalId)
    }
  }, [navigate])

  const theme = useThemeManagement()
  const { isDarkMode } = theme
  const {
    categorizeNotifications,
    groupAdministrativeNotifications,
    parseNotificationData,
    getNotificationIcon,
    getNotificationIconColor,
    getNotificationBorderColor,
    getNotificationBgColor,
    getActionButtonColor,
    getTitleColor,
    getNotificationAction,
    formatNotificationTitle,
    formatNotificationBody,
    isUrgentNotification,
    formatTimestamp
  } = useNotifications()
  const {
    quickGradeType,
    setQuickGradeType,
    quickGradeTitle,
    setQuickGradeTitle,
    quickGradeMaxPoints,
    setQuickGradeMaxPoints,
    quickGradeDueDate,
    setQuickGradeDueDate,
    showQuickGradeGrid,
    setShowQuickGradeGrid,
    quickGradeScores,
    setQuickGradeScores,
    showFillScoreModal,
    setShowFillScoreModal,
    fillScoreValue,
    setFillScoreValue,
    isSavingGrades,
    gradesSaveStatus,
    handleInitQuickGrade,
    handleFillAllGrades,
    handleFillScoreSubmit,
    handleFillScoreCancel,
    handleSaveAllGrades,
    resetQuickGrade
  } = useQuickGrade()


  const modals = useModals({
    profile: false,
    addSubject: false,
    notifications: false,
    logout: false,
    addStudent: false,
    addStudentToSubject: false,
    deleteSubject: false
  })

  const [showProfileModal, setShowProfileModal] = modals.getModal('profile')
  const [showAddSubjectModal, setShowAddSubjectModal] = modals.getModal('addSubject')
  const [showNotifDropdown, setShowNotifDropdown] = modals.getModal('notifications')
  const [showLogoutModal, setShowLogoutModal] = modals.getModal('logout')
  const [showAddStudentModal, setShowAddStudentModal] = modals.getModal('addStudent')
  const [showAddStudentToSubjectModal, setShowAddStudentToSubjectModal] = modals.getModal('addStudentToSubject')
  const [showDeleteSubjectModal, setShowDeleteSubjectModal] = modals.getModal('deleteSubject')


  const dataFetching = useDataFetching(addCustomAlert)


  const [uiState, uiActions] = useProfUIState()
  

  const {
    activeTab, newSubject, profileForm, profileSaveSuccess, addSubjectError, isSavingSubject,
    showProfileDropdown, showSubjectDetail, selectedSubject, showArchivedStudents,
    newStudent, newStudentQuick, alreadyEnrolledMessage, selectedSubjectForStudent,
    studentSubjectFilter, subjectSearchQuery, subjectFilterTerm, subjectSortBy,
    subjectSortOrder, subjectPage, studentToAdd, studentSearchTermAdd,
    showStudentSearchDropdownAdd, addStudentModalTab, selectedStudentsForBulk,
    selectedSubjectsForBulk, selectAllStudents, selectedArchivedSubjects,
    selectAllArchivedSubjects, selectedRecycleBinSubjects, selectAllRecycleBinSubjects,
    archivedStudentDetailView, studentSearchTerm, showSearchDropdown,
    studentRecordSearchTerm, studentRecordFilter, showRestoreSubjectDropdown,
    showNewStudentSubjectDropdown
  } = uiState

  const {
    setActiveTab, updateNewSubject, updateProfileForm, updateNewStudent, updateNewStudentQuick,
    setProfileSaveSuccess, setAddSubjectError, setIsSavingSubject, setAlreadyEnrolledMessage,
    setShowProfileDropdown, setShowSubjectDetail, setShowArchivedStudents,
    setShowStudentSearchDropdownAdd, setShowSearchDropdown, setShowRestoreSubjectDropdown,
    setShowNewStudentSubjectDropdown, setSelectedSubject, setSelectedSubjectForStudent,
    setArchivedStudentDetailView, setSubjectSearchQuery, setSubjectFilterTerm,
    setSubjectSortBy, setSubjectSortOrder, setSubjectPage, setStudentSubjectFilter,
    setStudentSearchTerm, setStudentSearchTermAdd, setStudentRecordSearchTerm,
    setStudentRecordFilter, setAddStudentModalTab, setSelectedStudentsForBulk,
    setSelectedSubjectsForBulk, setSelectAllStudents, setSelectedArchivedSubjects,
    setSelectAllArchivedSubjects, setSelectedRecycleBinSubjects, setSelectAllRecycleBinSubjects,
    setStudentToAdd, resetNewSubject, resetNewStudent
  } = uiActions

  const [profName, setProfName] = useState('Professor User')
  const [profPic, setProfPic] = useState(null)
  const originalProfPicRef = useRef(null)
  

  const [subjects, setSubjects] = useState([])
  const [removedSubjects, setRemovedSubjects] = useState([])
  const [recycleBinSubjects, setRecycleBinSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [enrolls, setEnrolls] = useState({})
  const [alerts, setAlerts] = useState([])
  const [archivingStudentIds, setArchivingStudentIds] = useState({})
  const [records, setRecords] = useState({})
  const [grades, setGrades] = useState({})
  const [currentSubject, setCurrentSubject] = useState(null)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10))
  const [currentTime, setCurrentTime] = useState('')
  const realtimeUnsubscribeRef = useRef(null)
  const previousDataRef = useRef(null)
  const isImportingRef = useRef(false)
  const lastImportTimeRef = useRef(0)
  const dataLoadTimeRef = useRef(0)


  const subjectManagement = useSubjectManagement({
    subjects,
    setSubjects,
    removedSubjects,
    setRemovedSubjects,
    students,
    enrolls,
    setNormalizedEnrolls,
    alerts,
    records,
    grades,
    profUid,
    profProfile,
    subjectsHook,
    enrollmentsHook,
    saveData,
    addCustomAlert,
    setActiveTab,
    setShowSubjectDetail,
    setSelectedSubject,
    setShowAddSubjectModal,
    setSubjectPendingDelete,
    setDeleteSubjectMode,
    setShowDeleteSubjectModal,
    buildEnrollsFromMySQL
  })
  

  const [subjectItemsPerPage] = useState(12)
  


  const onSaveAdapter = useCallback(async (partialData) => {

    const mergedData = {
      subjects: partialData.subjects ?? subjects,
      students: partialData.students ?? students,
      enrolls: partialData.enrolls ?? enrolls,
      alerts: partialData.alerts ?? alerts,
      records: partialData.records ?? records,
      grades: partialData.grades ?? grades,
    }
    await saveData(
      mergedData.subjects,
      mergedData.students,
      mergedData.enrolls,
      mergedData.alerts,
      mergedData.records,
      mergedData.grades,
      profUid,
      false
    )
  }, [subjects, students, enrolls, alerts, records, grades, profUid])
  

  const subjectsHook = useSubjects(profUid, onSaveAdapter)
  const studentsHook = useStudents(onSaveAdapter)
  const enrollmentsHook = useEnrollments(profUid, onSaveAdapter)
  const gradesHook = useGrades(onSaveAdapter)
  const attendanceHook = useAttendance(onSaveAdapter)
  const { loadData: loadProfessorData, saveData: saveProfessorData } = useProfessorData(profUid)
  

  useEffect(() => {
    if (subjects.length > 0 && subjectsHook.subjects.length === 0) {
      subjectsHook.setSubjects(subjects)
    }
  }, [subjects.length])
  
  useEffect(() => {
    if (students.length > 0 && studentsHook.students.length === 0) {
      studentsHook.setStudents(students)
    }
  }, [students.length])
  
  useEffect(() => {
    if (Object.keys(enrolls).length > 0 && Object.keys(enrollmentsHook.enrolls).length === 0) {
      enrollmentsHook.setEnrolls(enrolls)
    }
  }, [Object.keys(enrolls).length])
  
  useEffect(() => {
    if (Object.keys(grades).length > 0 && Object.keys(gradesHook.grades).length === 0) {
      gradesHook.setGrades(grades)
    }
  }, [Object.keys(grades).length])
  
  useEffect(() => {
    if (Object.keys(records).length > 0 && Object.keys(attendanceHook.records).length === 0) {
      attendanceHook.setRecords(records)
    }
  }, [Object.keys(records).length])
  

  const { saveData, executeSave } = useProfDataSaving({
    profUid,
    subjects,
    removedSubjects,
    students,
    enrolls,
    alerts,
    records,
    grades,
    addCustomAlert
  })


  saveDataRef.current = saveData



  const saveDataRef = useRef(null)
  
  const addCustomAlert = useCallback(async (type, title, message, autoSave = true) => {

    const newAlert = {
      id: Date.now(),
      type: type || 'general',
      title: title || 'Notification',
      message: message || '',
      timestamp: new Date(),
      read: false,
      target_courseId: null,
    }
    

    const updatedAlerts = [newAlert, ...alerts]
    setAlerts(updatedAlerts)
    

    if (autoSave && saveDataRef.current) {
      try {
        await saveDataRef.current(subjects, students, enrolls, updatedAlerts, records, grades, profUid, true)
      } catch (error) {
        console.warn('Failed to save notification alert', error)
      }
    }
    
    return newAlert
  }, [alerts, subjects, students, enrolls, records, grades, profUid])
  

  const csvImportHook = useCSVImport(
    async (importData) => {


    },
    addCustomAlert
  )
  

  const { csvFile, csvPreview, csvImportWarnings, isImporting, handleFileSelect, setCsvFile, setCsvPreview, setCsvImportWarnings } = csvImportHook
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [viewMode, setViewMode] = useState('professor')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentDetailSubject, setStudentDetailSubject] = useState(null)
  const [subjectPreviewCode, setSubjectPreviewCode] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)
  const [studentAlerts, setStudentAlerts] = useState([])
  const [profUid, setProfUid] = useState(null)
  const [profEmail, setProfEmail] = useState('')
  const [profProfile, setProfProfile] = useState(null)
  const [studentProfileName, setStudentProfileName] = useState(null)
  const [profileSection, setProfileSection] = useState('account')
  const [realtimeUpdatesDisabled, setRealtimeUpdatesDisabled] = useState(() => {
    try {
      return localStorage.getItem('disableRealtimeUpdates') === 'true'
    } catch {
      return false
    }
  })
  const [subjectCourseMap, setSubjectCourseMap] = useState({})
  const courseEnrollmentListenersRef = useRef({})
  const [subjectPendingDelete, setSubjectPendingDelete] = useState(null)
  const [deleteSubjectMode, setDeleteSubjectMode] = useState('delete')
  const [subjectsView, setSubjectsView] = useState('active')
  const [archivedSubjectsSearchTerm, setArchivedSubjectsSearchTerm] = useState('')
  const restoreSubjectDropdownRef = useRef(null)
  const newStudentSubjectDropdownRef = useRef(null)
  const [isAddingStudentToSubject, setIsAddingStudentToSubject] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const studentsById = useMemo(() => {
    const map = {}
    students.forEach(student => {
      const key = normalizeStudentId(student.id)
      if (key) {
        map[key] = student
      }
    })
    return map
  }, [students])

  const selectedStudentIdSet = useMemo(() => {
    return new Set(selectedStudentsForBulk.map(normalizeStudentId).filter(Boolean))
  }, [selectedStudentsForBulk])

  const setNormalizedEnrolls = useCallback((nextValue) => {
    if (typeof nextValue === 'function') {
      setEnrolls(prev => normalizeEnrollsMap(nextValue(prev)))
    } else {
      setEnrolls(normalizeEnrollsMap(nextValue))
    }
  }, [setEnrolls])

  const getSubjectLabel = useCallback((subjectCode) => {
    const subject = subjects.find(s => s.code === subjectCode)
    return subject ? `${subject.code} � ${subject.name}` : subjectCode
  }, [subjects])

  const navigateToSubjectTab = useCallback((subjectCode, tab) => {
    if (!subjectCode) return
    const findSubjectByCode = (code) => {
      if (!code) return null
      let subject = subjects.find(s => s.code === code)
      if (subject) return subject
      subject = subjects.find(s => s.code?.toLowerCase() === code.toLowerCase())
      if (subject) return subject
      subject = subjects.find(s => s.code?.includes(code) || code.includes(s.code))
      return subject || null
    }
    const subject = findSubjectByCode(subjectCode)
    if (!subject) return

    setSelectedSubject(subject)
    if (tab === 'attendance' || tab === 'grades' || tab === 'students' || tab === 'subjects') {
      setActiveTab(tab)
    }
    setShowNotifDropdown(false)


    try {
      const params = new URLSearchParams(location.search)
      params.set('tab', tab)
      params.set('subjectId', subject.code)
      navigate({ pathname: location.pathname, search: params.toString() })
    } catch {

    }
  }, [subjects, navigate, location.pathname, location.search])


  useEffect(() => {
    const loadRealtimePreference = async () => {
      if (!profUid || !profProfile) return
      
      try {

        const profile = await getWithBackup('professors', profUid)
        if (profile?.preferences?.disableRealtimeUpdates !== undefined) {
          const firestoreValue = profile.preferences.disableRealtimeUpdates
          const localValue = localStorage.getItem('disableRealtimeUpdates') === 'true'
          

          if (firestoreValue !== localValue) {
            if (firestoreValue) {
              localStorage.setItem('disableRealtimeUpdates', 'true')
            } else {
              localStorage.removeItem('disableRealtimeUpdates')
            }
            setRealtimeUpdatesDisabled(firestoreValue)
          }
        } else {

          const localValue = localStorage.getItem('disableRealtimeUpdates') === 'true'
          if (localValue) {
            setRealtimeUpdatesDisabled(true)

            try {
              const currentProfile = await getProfessorByUid(profUid)
              await setWithBackup('professors', profUid, {
                ...currentProfile,
                preferences: {
                  ...(currentProfile?.preferences || {}),
                  disableRealtimeUpdates: true,
                }
              }, { merge: true })
            } catch (e) {

              console.warn('Could not sync preference to Firestore:', e.message)
            }
          }
        }
      } catch (error) {

        console.warn('Could not load real-time preference from Firestore, using localStorage:', error.message)
        const localValue = localStorage.getItem('disableRealtimeUpdates') === 'true'
        setRealtimeUpdatesDisabled(localValue)
      }
    }
    
    loadRealtimePreference()
  }, [profUid, profProfile])



  useEffect(() => {
    if (!profUid || subjects.length === 0) return
    

    const quotaExceeded = localStorage.getItem('lastQuotaError')
    if (quotaExceeded) {
      const timeSinceError = Date.now() - parseInt(quotaExceeded)

      if (timeSinceError < 3600000) {

        return
      }
    }
    
    let cancelled = false

    const ensureCoursesForSubjects = async () => {
      const pendingUpdates = {}

      for (const subject of subjects) {
        const code = subject?.code
        if (!code || subjectCourseMap[code] || pendingUpdates[code]) continue
        try {

          const storageKey = `firestore_backup_courses_${code}`
          const backup = localStorage.getItem(storageKey)
          let course = null
          
          if (backup) {
            try {
              const parsed = JSON.parse(backup)
              const courseData = parsed.data

              if (courseData && courseData.code === code) {
                course = { id: code, ...courseData }
              }
            } catch (e) {

            }
          }
          

          if (!course) {
            course = await getCourseByCode(code)
          }
          
          if (!course) {

            let profProfile = await getProfessorByUid(profUid)
            if (!profProfile || !profProfile.id) {
              console.error('? Professor profile not found when creating course')
              continue
            }

            const credits = parseInt(subject.credits) || 0
            const courseId = await createCourse({
              code: subject.code,
              name: subject.name,
              credits: credits,
              professorId: profProfile.id,
            })
            course = { id: courseId }
          }
          pendingUpdates[code] = course.id
        } catch (error) {

          if (error.code === 'resource-exhausted' || error.message?.includes('quota')) {
            console.warn('?? Quota exceeded - stopping course creation checks')
            localStorage.setItem('lastQuotaError', Date.now().toString())
            break
          }
          console.warn('Failed to resolve course for subject', code, error)
        }
      }

      if (!cancelled && Object.keys(pendingUpdates).length > 0) {
        setSubjectCourseMap(prev => ({ ...prev, ...pendingUpdates }))
      }
    }


    const hasRun = sessionStorage.getItem('coursesEnsured')
    if (!hasRun) {
      ensureCoursesForSubjects()
      sessionStorage.setItem('coursesEnsured', 'true')
    }

    return () => {
      cancelled = true
    }
  }, [profUid])


  const DASHBOARD_COLLECTION = 'professorDashboards'
  


  

  const updateSessionUser = useCallback((updates) => {
    updateSessionUserFields(updates)
  }, [])



  const buildEnrollsFromMySQL = useCallback(async (professorMySQLId, subjectsList) => {
    if (!professorMySQLId) {
      console.warn('Cannot build enrolls: professor MySQL ID not available')
      return { enrolls: {}, enrolledStudentIds: [] }
    }

    try {

      

      const courses = await getCoursesByProfessor(professorMySQLId)

      

      const enrollsObject = {}
      const enrolledStudentIds = new Set()
      

      for (const course of courses) {
        const enrollments = await getEnrollmentsByCourse(course.id)
        const studentIds = []
        
        for (const enrollment of enrollments) {

          const studentNumber = enrollment.student_number || enrollment.student_id
          if (studentNumber) {
            const normalizedId = normalizeStudentId(studentNumber)
            studentIds.push(normalizedId)
            enrolledStudentIds.add(normalizedId)
          }
        }
        
        if (studentIds.length > 0) {
          enrollsObject[course.code] = studentIds
        }
      }
      

      

      return {
        enrolls: normalizeEnrollsMap(enrollsObject),
        enrolledStudentIds: Array.from(enrolledStudentIds)
      }
    } catch (error) {
      console.error('? Error building enrolls from MySQL:', error)
      return { enrolls: {}, enrolledStudentIds: [] }
    }
  }, [])

  const loadData = useCallback(async (uid) => {
    if (!uid) {
      console.warn('loadData called without UID')
      return false
    }
    setIsLoading(true)
    try {

      const saved = await getWithBackup(DASHBOARD_COLLECTION, uid)
      if (saved) {

        

        const migrated = migrateDashboardData(saved)
        

        const needsMigration = JSON.stringify(saved) !== JSON.stringify(migrated)
        if (needsMigration) {



          await setWithBackup(DASHBOARD_COLLECTION, uid, {
            ...migrated,
            ownerUid: uid,
            updatedAt: new Date().toISOString(),
          }, { forceWrite: true })

        }
        



        const studentsWithArchived = (migrated.students || []).map(s => ({
          ...s,
          archivedSubjects: Array.isArray(s.archivedSubjects) ? s.archivedSubjects : []
        }))
        

        const studentsWithArchivedSubjects = studentsWithArchived.filter(s => 
          Array.isArray(s.archivedSubjects) && s.archivedSubjects.length > 0
        )
        if (studentsWithArchivedSubjects.length > 0) {

        }
        



        const normalizedLoadedEnrolls = normalizeEnrollsMap(migrated.enrolls || {})
        const cleanedEnrolls = {}
        Object.keys(normalizedLoadedEnrolls).forEach(subjectCode => {
          const enrolledIds = normalizedLoadedEnrolls[subjectCode] || []

          const normalizedEnrolledIds = enrolledIds.map(normalizeStudentId).filter(Boolean)
          


          cleanedEnrolls[subjectCode] = normalizedEnrolledIds.filter(enrolledId => {

            const student = studentsWithArchived.find(s => {
              const studentId = normalizeStudentId(s.id)
              return studentId === enrolledId
            })
            


            if (!student) {
              console.warn(`?? Enrollment found for student ID ${enrolledId} in subject ${subjectCode}, but student not found in students array. Keeping enrollment.`, {
                enrolledId,
                subjectCode,
                totalStudents: studentsWithArchived.length,
                studentIds: studentsWithArchived.map(s => normalizeStudentId(s.id))
              })
              return true
            }
            

            const isArchived = (student.archivedSubjects || []).includes(subjectCode)
            if (isArchived) {

            }
            return !isArchived
          })
        })
        


        const normalizedLoadedForCompare = normalizeEnrollsMap(migrated.enrolls || {})
        const hadInconsistencies = JSON.stringify(normalizedLoadedForCompare) !== JSON.stringify(cleanedEnrolls)
        if (hadInconsistencies) {
          console.warn('?? Data inconsistency detected: Archived students found in enrolls. Cleaning and saving...')

          try {


            await setWithBackup(DASHBOARD_COLLECTION, uid, {
              ...migrated,
              enrolls: cleanedEnrolls,
              ownerUid: uid,
              updatedAt: new Date().toISOString(),
            }, { forceWrite: true })

          } catch (error) {
            console.error('Failed to save cleaned enrolls:', error)
          }
        }
        


        let mysqlEnrolls = {}
        let enrolledStudentIds = []
        try {
          const profProfile = await getProfessorByUid(uid)
          if (profProfile && profProfile.id) {

            const mysqlResult = await buildEnrollsFromMySQL(profProfile.id, migrated.subjects || [])
            mysqlEnrolls = mysqlResult.enrolls || mysqlResult
            enrolledStudentIds = mysqlResult.enrolledStudentIds || []
          } else {
            console.warn('?? Professor MySQL ID not found, using empty enrolls')
          }
        } catch (error) {
          console.error('? Failed to build enrolls from MySQL, using Firestore enrolls as fallback:', error)

          mysqlEnrolls = normalizeEnrollsMap(cleanedEnrolls)
          enrolledStudentIds = []
        }
        

        if (enrolledStudentIds.length > 0) {
          const existingStudentIds = new Set(studentsWithArchived.map(s => normalizeStudentId(s.id)))
          const missingIds = enrolledStudentIds.filter(id => !existingStudentIds.has(id))
          
          if (missingIds.length > 0) {

            try {

              const allMySQLStudents = await listStudents()
              const missingStudents = allMySQLStudents.filter(s => {
                const studentId = normalizeStudentId(s.student_id || s.studentId || s.id)
                return missingIds.includes(studentId)
              })
              
              if (missingStudents.length > 0) {


                const formattedMissingStudents = missingStudents.map(s => ({
                  id: normalizeStudentId(s.student_id || s.studentId || String(s.id)),
                  name: s.name || 'Unknown Student',
                  email: s.email || '',
                  department: s.department || '',
                  archivedSubjects: [],
                  photoURL: s.photo_url || s.photoURL || ''
                }))
                

                studentsWithArchived.push(...formattedMissingStudents)

              } else {
                console.warn(`?? Could not find ${missingIds.length} enrolled students in MySQL database. They may need to be created.`)
              }
            } catch (error) {
              console.error('? Error loading missing students from MySQL:', error)
            }
          }
        }
        
        const finalEnrolls = mysqlEnrolls
        


        const enrollmentStudentIds = new Set()
        Object.values(finalEnrolls || {}).forEach(enrolledIds => {
          enrolledIds.forEach(id => enrollmentStudentIds.add(normalizeStudentId(id)))
        })
        
        const studentIds = new Set(studentsWithArchived.map(s => normalizeStudentId(s.id)))
        const missingEnrollmentStudents = Array.from(enrollmentStudentIds).filter(id => !studentIds.has(id))
        
        if (missingEnrollmentStudents.length > 0) {
          console.warn('?? Found enrollments for students not in local students array (may be in MySQL):', {
            missingStudentIds: missingEnrollmentStudents,
            totalEnrollments: enrollmentStudentIds.size,
            totalStudents: studentIds.size
          })
        } else {

        }
        


        const loadedSubjects = migrated.subjects || []
        const loadedStudents = studentsWithArchived
        const loadedEnrolls = finalEnrolls
        const loadedRecords = migrated.records || {}
        const loadedGrades = migrated.grades || {}
        
        setSubjects(loadedSubjects)
        setRemovedSubjects(migrated.removedSubjects || [])
        setRecycleBinSubjects(migrated.recycleBinSubjects || [])
        setStudents(loadedStudents)
        setNormalizedEnrolls(loadedEnrolls)
        setAlerts(migrated.alerts || [])
        setRecords(loadedRecords)
        setGrades(loadedGrades)
        

        subjectsHook.setSubjects(loadedSubjects)
        studentsHook.setStudents(loadedStudents)
        enrollmentsHook.setEnrolls(loadedEnrolls)
        attendanceHook.setRecords(loadedRecords)
        gradesHook.setGrades(loadedGrades)
        

        dataLoadTimeRef.current = Date.now()
        

        setRefreshTrigger(prev => prev + 1)
        

        

        

        Object.keys(finalEnrolls || {}).forEach(subjectCode => {
          const enrolledIds = finalEnrolls[subjectCode] || []
          const missingStudents = enrolledIds.filter(id => {
            const normalizedId = normalizeStudentId(id)
            return !studentsWithArchived.find(s => normalizeStudentId(s.id) === normalizedId)
          })
          if (missingStudents.length > 0) {
            console.warn(`?? Subject ${subjectCode} has ${missingStudents.length} enrolled students not found in students array:`, {
              missingIds: missingStudents,
              enrolledIds: enrolledIds,
              totalEnrolled: enrolledIds.length,
              studentsInSystem: studentsWithArchived.map(s => normalizeStudentId(s.id)),
              subjectCode
            })


            missingStudents.forEach(missingId => {
              const normalizedMissing = normalizeStudentId(missingId)
              const similarStudents = studentsWithArchived.filter(s => {
                const studentId = normalizeStudentId(s.id)
                return studentId.includes(normalizedMissing) || normalizedMissing.includes(studentId)
              })
              if (similarStudents.length > 0) {
                console.warn(`  Found similar student IDs for ${missingId}:`, similarStudents.map(s => s.id))
              }
            })
          } else {


          }
        })
        
        setIsLoading(false)
        return true
      } else {

        const defaultSubjects = [
          { code: "CCE106 2061", name: "Application Dev", credits: "3" },
          { code: "IT 14 2062", name: "Professional Track", credits: "4" },
          { code: "IT11 2063", name: "Networking II", credits: "5" },
        ]
        const defaultStudents = []
        const defaultEnrolls = {}
        setSubjects(defaultSubjects)
        setStudents(defaultStudents)
        setNormalizedEnrolls(defaultEnrolls)
        setRecords({})
        setGrades({})

        await setWithBackup(DASHBOARD_COLLECTION, uid, {
          subjects: defaultSubjects,
          students: defaultStudents,

          alerts: [],
          records: {},
          grades: {},
          ownerUid: uid,
          updatedAt: new Date().toISOString(),
        })

        setIsLoading(false)
        return true
      }
    } catch (e) {
      console.error('Failed to load professor dashboard data', e)
      

      if (e.code === 'resource-exhausted' || e.message?.includes('quota') || e.message?.includes('Quota')) {
        console.error('?? Firestore quota exceeded!')
        console.error('?? To reduce quota usage, disable real-time updates:')
        console.error('   localStorage.setItem("disableRealtimeUpdates", "true")')
        console.error('?? Or upgrade to Blaze plan for higher limits')


      }
      
      setIsLoading(false)
      return false
    }
  }, [])


  const refreshData = useCallback(async () => {
    if (!profUid) {
      console.warn('Cannot refresh: No professor UID available')
      return
    }

    try {
      const loaded = await loadData(profUid)
      if (loaded && profProfile && profProfile.id) {
        const rebuiltResult = await buildEnrollsFromMySQL(profProfile.id, subjects)
        const rebuiltEnrolls = rebuiltResult.enrolls || rebuiltResult
        setNormalizedEnrolls(rebuiltEnrolls)

        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('? Failed to refresh data:', error)
      setIsLoading(false)
    }
  }, [profUid, profProfile, loadData, buildEnrollsFromMySQL, subjects, setNormalizedEnrolls])



  const waitForAuthUser = useCallback(() => {
    return new Promise((resolve) => {
      if (auth?.currentUser) {
        resolve(auth.currentUser)
        return
      }
      const unsubscribe = watchAuthState((user) => {
        unsubscribe()
        resolve(user || null)
      })
    })
  }, [])

  useEffect(() => {
    const initializeProfessor = async () => {
      let firebaseUser = auth?.currentUser
      if (!firebaseUser) {
        firebaseUser = await waitForAuthUser()
      }

      if (!firebaseUser) {
        navigate('/login', { replace: true })
        return
      }

      let userData = getCurrentUserData()

      if (!userData || userData.uid !== firebaseUser.uid) {
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Professor User',
        }
        updateSessionUserFields(userData)
      }

      setProfUid(firebaseUser.uid)
      if (userData.email) setProfEmail(userData.email)
      if (userData.name) {
        setProfName(userData.name)
        updateProfileForm({ name: userData.name })
      }

      const profilePromise = getProfessorByUid(firebaseUser.uid).catch(err => {
        console.warn('Unable to load professor profile from database', err)
        return null
      })

      const dashboardPromise = loadData(firebaseUser.uid).catch(err => {
        console.error('Failed to load professor dashboard data', err)
        return false
      })

      let profile = await profilePromise
      const dashboardLoaded = await dashboardPromise
      
      if (dashboardLoaded) {


        if (profile && profile.id) {
          try {
            const currentSubjects = subjects.length > 0 ? subjects : []
            const rebuiltResult = await buildEnrollsFromMySQL(profile.id, currentSubjects)
            const rebuiltEnrolls = rebuiltResult.enrolls || rebuiltResult
            if (Object.keys(rebuiltEnrolls).length > 0) {
              setNormalizedEnrolls(rebuiltEnrolls)

            }
          } catch (error) {
            console.error('Failed to rebuild enrolls after load:', error)
          }
        }
      } else if (dashboardLoaded === false) {
        console.error('Failed to load dashboard data - data may not persist correctly')

        setTimeout(async () => {

          const retryLoaded = await loadData(firebaseUser.uid)
          if (retryLoaded) {


            if (profile && profile.id) {
              try {
                const rebuiltResult = await buildEnrollsFromMySQL(profile.id, subjects)
                const rebuiltEnrolls = rebuiltResult.enrolls || rebuiltResult
                setNormalizedEnrolls(rebuiltEnrolls)

              } catch (error) {
                console.error('Failed to rebuild enrolls on retry:', error)
              }
            }
          }
        }, 2000)
      }



      if (!profile) {
        try {
          const fallbackName = userData.name || firebaseUser.displayName || 'Professor User'
          const defaultPhotoURL = getDefaultAvatar(fallbackName, firebaseUser.uid)

          const profileEmail = userData.email || firebaseUser.email
          if (!profileEmail) {
            console.warn('?? Cannot auto-create professor profile: email is missing')
            throw new Error('Email is required to create professor profile')
          }

          const newProfile = {
            name: fallbackName,
            email: profileEmail,
            role: 'Professor',
            department: '',
            photoURL: defaultPhotoURL,
          }

          const created = await setProfessor(firebaseUser.uid, newProfile)
          profile = created || newProfile

        } catch (e) {
          console.error('? Failed to auto-create professor profile:', e)
        }
      }

      if (profile) {
        setProfProfile(profile)
        if (profile.email) setProfEmail(profile.email)
        if (profile.name) {
          setProfName(profile.name)
          updateProfileForm({ name: profile.name })
        }

        const photo =
          profile.photoURL ||
          profile.photoUrl ||
          profile.photo_url ||
          null
        if (photo) {
          setProfPic(photo)
          setProfilePreview(photo)
        }
        

        if (!profile.id) {
          console.warn('?? Professor profile missing MySQL ID, reloading...')
          const reloadedProfile = await getProfessorByUid(firebaseUser.uid)
          if (reloadedProfile && reloadedProfile.id) {
            setProfProfile(reloadedProfile)

          }
        }
      }
    }


    let isMounted = true
    let initializationInProgress = false
    
    const runInitializeProfessor = async () => {

      if (initializationInProgress) {

        return
      }
      
      initializationInProgress = true
      
      try {
        await initializeProfessor()
      } catch (error) {
        if (error.name === 'AbortError' || error.message?.includes('cancelled')) {

          return
        }
        if (isMounted) {
          console.error('? Failed to initialize professor:', error)
        }
      } finally {
        initializationInProgress = false
      }
    }
    
    runInitializeProfessor()
    

    return () => {
      isMounted = false
      initializationInProgress = false
    }
    

    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const h12 = hours % 12 || 12
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const m = now.getMinutes().toString().padStart(2, '0')
      const s = now.getSeconds().toString().padStart(2, '0')
      setCurrentTime(`${h12}:${m}:${s} ${ampm}`)
    }
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)
    
    return () => {
      clearInterval(timeInterval)

      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current()
        realtimeUnsubscribeRef.current = null
      }
    }
  }, [navigate, loadData, waitForAuthUser])


  useEffect(() => {
    if (!profUid) return
    

    const isDisabled = localStorage.getItem('disableRealtimeUpdates') === 'true'
    if (isDisabled) {

      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current()
        realtimeUnsubscribeRef.current = null
      }
      return
    }


    const currentData = {
      subjects,
      students,
      enrolls,
      alerts,
      records,
      grades,
    }
    previousDataRef.current = currentData


    const unsubscribe = subscribeToProfessorDashboard(profUid, (updatedData) => {
      if (!updatedData) return


      if (isImportingRef.current) {

        return
      }



      const timeSinceLoad = Date.now() - (dataLoadTimeRef.current || 0)
      if (timeSinceLoad < 3000) {

        return
      }



      const timeSinceImport = Date.now() - (lastImportTimeRef.current || 0)
      if (timeSinceImport < 5000) {

        return
      }
      




      




      if (updatedData.subjects) {
        setSubjects(updatedData.subjects)
        subjectsHook.setSubjects(updatedData.subjects)
      }
      if (updatedData.removedSubjects) setRemovedSubjects(updatedData.removedSubjects)
      if (updatedData.students) {
        setStudents(updatedData.students)
        studentsHook.setStudents(updatedData.students)
      }
      if (updatedData.records) {
        setRecords(updatedData.records)
        attendanceHook.setRecords(updatedData.records)
      }
      if (updatedData.grades) {
        setGrades(updatedData.grades)
        gradesHook.setGrades(updatedData.grades)
      }




      if (updatedData.alerts) {
        const normalizedAlerts = updatedData.alerts.map(alert => {

          let normalizedTimestamp = alert.timestamp
          

          if (normalizedTimestamp && typeof normalizedTimestamp === 'object' && normalizedTimestamp.toDate) {
            normalizedTimestamp = normalizedTimestamp.toDate()
          }

          else if (typeof normalizedTimestamp === 'string') {
            const parsed = new Date(normalizedTimestamp)
            normalizedTimestamp = isNaN(parsed.getTime()) ? new Date() : parsed
          }

          else if (typeof normalizedTimestamp === 'number') {
            normalizedTimestamp = normalizedTimestamp > 1e12 
              ? new Date(normalizedTimestamp) 
              : new Date(normalizedTimestamp * 1000)
          }

          else if (normalizedTimestamp instanceof Date) {

          }

          else {
            normalizedTimestamp = new Date()
          }
          

          if (!normalizedTimestamp || isNaN(normalizedTimestamp.getTime())) {
            normalizedTimestamp = new Date()
          }
          
          return {
            ...alert,
            timestamp: normalizedTimestamp
          }
        })
        setAlerts(normalizedAlerts)
      }



      

      setRefreshTrigger(prev => prev + 1)


      previousDataRef.current = updatedData
    })

    realtimeUnsubscribeRef.current = unsubscribe

    return () => {
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current()
        realtimeUnsubscribeRef.current = null
      }
    }
  }, [profUid, subjects, students, enrolls, alerts, records, grades, realtimeUpdatesDisabled])


  useEffect(() => {
    return () => {

      if (pendingSaveRef.current && saveDataTimeoutRef.current) {
        clearTimeout(saveDataTimeoutRef.current)
        executeSave(pendingSaveRef.current.payload, pendingSaveRef.current.uidToUse).catch(err => {
          console.warn('Failed to save pending data on unmount:', err)
        })
      } else if (saveDataTimeoutRef.current) {
        clearTimeout(saveDataTimeoutRef.current)
      }
    }
  }, [executeSave])


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
    setStudentDetailSubject(null)
    setSubjectPreviewCode(null)
  }, [viewMode])

  useEffect(() => {
    setStudentDetailSubject(null)
  }, [selectedStudentId])

  useEffect(() => {
    if (viewMode === 'student' && !selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id)
    }
  }, [viewMode, students, selectedStudentId])

  useEffect(() => {
    if (viewMode === 'student' && selectedStudentId) {
      const metrics = getStudentMetrics(selectedStudentId)
      const studentSubjects = getStudentSubjects(selectedStudentId)
      const highlightedSubject = studentSubjects[0]
      const generatedAlerts = [
        {
          id: `attendance-${selectedStudentId}`,
          title: 'Attendance Update',
          message: `You are currently at ${metrics.attendanceRate}% attendance. Keep it up!`,
          timestamp: new Date(),
          read: false,
        },
        {
          id: `grade-${selectedStudentId}`,
          title: 'Grade Highlight',
          message: metrics.averageGrade === '0'
            ? 'Grades will appear here once assessments are recorded.'
            : `Your overall average grade is ${metrics.averageGrade}%.`,
          timestamp: new Date(),
          read: false,
        },
        highlightedSubject
          ? {
              id: `subject-${highlightedSubject.code}`,
              title: `${highlightedSubject.name}`,
              message: `Target grade ${highlightedSubject.targetGrade || 90}% � Attendance ${
                getSubjectAttendanceSummary(selectedStudentId, highlightedSubject.code).rate
              }%`,
              timestamp: new Date(),
              read: false,
            }
          : null,
      ].filter(Boolean)
      setStudentAlerts(generatedAlerts)
    } else if (viewMode !== 'student') {
      setStudentAlerts([])
    }
  }, [viewMode, selectedStudentId, subjects, enrolls, records, grades])

  useEffect(() => {
    if (showProfileModal) {
      updateProfileForm({ name: profName, pic: null, removePhoto: false })
      setProfilePreview(profPic)

      originalProfPicRef.current = profPic
    } else {

      if (originalProfPicRef.current !== null && profPic === null && !profileSaveSuccess) {
        setProfPic(originalProfPicRef.current)
        setProfilePreview(originalProfPicRef.current)
      }

      originalProfPicRef.current = null
    }
  }, [showProfileModal, profName, profPic, profileSaveSuccess])


  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const tabParam = params.get('tab')
      const subjectIdParam = params.get('subjectId')

      if (tabParam === 'attendance' || tabParam === 'grades' || tabParam === 'students' || tabParam === 'subjects') {
        setActiveTab(tabParam)
      }

      if (subjectIdParam && subjects.length > 0) {
        const findSubjectByCode = (code) => {
          if (!code) return null
          let subject = subjects.find(s => s.code === code)
          if (subject) return subject
          subject = subjects.find(s => s.code?.toLowerCase() === code.toLowerCase())
          if (subject) return subject
          subject = subjects.find(s => s.code?.includes(code) || code.includes(s.code))
          return subject || null
        }
        const subject = findSubjectByCode(subjectIdParam)
        if (subject) {
          setSelectedSubject(subject)
        }
      }
    } catch {

    }
  }, [location.search, subjects])



  useEffect(() => {
    if (location.pathname !== '/prof') return

    const handlePopState = (event) => {
      const userData = getCurrentUserData()

      if (window.location.pathname === '/login' && userData) {
        event.preventDefault()

        window.history.pushState(null, '', '/prof')
        navigate('/prof', { replace: true })
      } else {

      window.history.pushState(null, '', window.location.href)
      }
    }


    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (restoreSubjectDropdownRef.current && !restoreSubjectDropdownRef.current.contains(event.target)) {
        setShowRestoreSubjectDropdown(false)
      }
      if (newStudentSubjectDropdownRef.current && !newStudentSubjectDropdownRef.current.contains(event.target)) {
        setShowNewStudentSubjectDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  useEffect(() => {
    if (showAddSubjectModal) {
      setAddSubjectError('')
      setIsSavingSubject(false)
    }
  }, [showAddSubjectModal])


  useEffect(() => {
    if (addSubjectError && (newSubject.code || newSubject.name || newSubject.credits)) {
      setAddSubjectError('')
    }

  }, [newSubject.code, newSubject.name, newSubject.credits, newSubject.term])



  const executeLogout = async () => {

    if (profUid) {
      try {
        await saveData(subjects, students, enrolls, alerts, records, grades, profUid)

      } catch (error) {
        console.error('Failed to save data before logout', error)

      }
    }
    sessionStorage.removeItem('currentUser')
    navigate('/login', { replace: true })
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }




  const handleUpdateSubjectTerm = async (subjectCode, newTerm, e) => {
    if (e) {
      e.stopPropagation()
    }
    
    try {
      const subject = subjects.find(s => s.code === subjectCode)
      if (!subject) {
        addCustomAlert('error', 'Subject Not Found', 'Subject not found. Please refresh and try again.', false)
        return
      }

      const updatedSubjects = subjects.map(subject => 
        subject.code === subjectCode 
          ? { ...subject, term: newTerm }
          : subject
      )
      
      setSubjects(updatedSubjects)
      

      try {
        const course = await getCourseByCode(subjectCode)
        if (course && course.id) {
          await updateCourse(course.id, { term: newTerm })

        } else {
          console.warn(`?? Course not found in MySQL for ${subjectCode}, term not updated in database`)
        }
      } catch (mysqlError) {
        console.error('? Failed to update course term in MySQL:', mysqlError)

      }
      

      await saveData(updatedSubjects, students, enrolls, alerts, records, grades, profUid)
      

      const enrolledStudentIds = enrolls[subjectCode] || []
      if (enrolledStudentIds.length > 0) {

        

        const syncPromises = enrolledStudentIds.map(async (studentId) => {
          try {
            const normalizedId = normalizeStudentId(studentId)
            const student = findStudentById(students, normalizedId)
            if (!student || !student.email) {
              console.warn(`?? Student ${normalizedId} not found or missing email, skipping sync`)
              return
            }


            const verification = await verifyStudentIdEmailPair(student.id, student.email)
            let studentUid = null
            
            if (verification.verified && verification.uid) {
              studentUid = verification.uid
            } else {
              const uidFromSync = await getStudentUidForSync(student.id, student.email)
              if (uidFromSync && typeof uidFromSync === 'string') {
                studentUid = uidFromSync
              }
            }

            if (studentUid && typeof studentUid === 'string') {

              const currentDashboard = await getStudentDashboard(studentUid)
              const currentSubjects = currentDashboard?.subjects || []
              

              const updatedStudentSubjects = currentSubjects.map(subj => 
                subj.code === subjectCode 
                  ? { ...subj, term: newTerm }
                  : subj
              )
              

              await syncStudentSubjects(studentUid, updatedStudentSubjects)

            } else {
              console.warn(`?? Could not find Firebase UID for student ${student.id}, term will sync when student logs in`)
            }
          } catch (error) {
            console.error(`? Failed to sync term update to student ${studentId}:`, error)
          }
        })


        Promise.all(syncPromises).then(() => {

        }).catch(err => {
          console.error('Some term syncs failed:', err)
        })
      }
      

      const newAlert = {
        id: Date.now(),
        type: 'general',
        title: 'Term Updated',
        message: `Subject term has been updated to ${newTerm === 'first' ? '1st Term' : '2nd Term'}. ${enrolledStudentIds.length > 0 ? `Syncing to ${enrolledStudentIds.length} enrolled student(s)...` : ''}`,
        timestamp: new Date(),
        read: false,
      }
      setAlerts(prev => [newAlert, ...prev])
    } catch (error) {
      console.error('Failed to update subject term', error)
      addCustomAlert('error', 'Update Failed', 'Failed to update subject term. Please try again.', false)
    }
  }

  const toggleRestoreSubjectSelection = (subjectCode) => {
    setSelectedSubjectsForBulk(prev => {
      if (prev.includes(subjectCode)) {
        return prev.filter(code => code !== subjectCode)
      }
      return [...prev, subjectCode]
    })
  }

  const toggleNewStudentSubjectSelection = (subjectCode) => {
    const current = newStudent.subjects || []
      if (current.includes(subjectCode)) {
      updateNewStudent({ ...newStudent, subjects: current.filter(code => code !== subjectCode) })
    } else {
      updateNewStudent({ ...newStudent, subjects: [...current, subjectCode] })
      }
  }



  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject)
    setShowSubjectDetail(true)
  }

  const handleBackToSubjects = () => {
    setShowSubjectDetail(false)
    setSelectedSubject(null)
    setCurrentSubject(null)
    if (activeTab !== 'subjects') {
      setActiveTab('subjects')
    }
  }

  const handleTakeAttendance = () => {
    if (selectedSubject) {
      setCurrentSubject(selectedSubject)
      setActiveTab('attendance')
      setShowSubjectDetail(false)
    }
  }

  const handleManageGrades = () => {
    if (selectedSubject) {
      setCurrentSubject(selectedSubject)
      setActiveTab('grades')
      setShowSubjectDetail(false)
    }
  }

  const toggleAttendance = (studentId, status) => {
    if (!currentSubject) return
    
    const date = attendanceDate
    const updatedRecords = { ...records }
    if (!updatedRecords[date]) updatedRecords[date] = {}
    if (!updatedRecords[date][currentSubject.code]) updatedRecords[date][currentSubject.code] = {}
    
    const currentStatus = updatedRecords[date][currentSubject.code][studentId]
    if (currentStatus === status) {
      delete updatedRecords[date][currentSubject.code][studentId]
    } else {
      updatedRecords[date][currentSubject.code][studentId] = status
    }
    

    setRecords(updatedRecords)
    

    saveData(subjects, students, enrolls, alerts, updatedRecords, grades, profUid, true).catch(err => 
      console.warn('Background save failed', err)
    )
      

    const student = findStudentById(students, studentId)
    if (student && currentStatus !== status) {

      Promise.resolve().then(async () => {
        try {

          const verification = await verifyStudentIdEmailPair(student.id, student.email)
          
          if (verification.verified && verification.uid) {
            await syncStudentAttendance(verification.uid, currentSubject.code, date, status, {
              subjectName: currentSubject.name,
              dateLabel: formattedDate,
            })
          } else {

            const studentUid = await getStudentUidForSync(student.id, student.email)
            if (studentUid) {
              await syncStudentAttendance(studentUid, currentSubject.code, date, status, {
                subjectName: currentSubject.name,
                dateLabel: formattedDate,
              })
            }
          }
        } catch (error) {
          console.warn('Failed to sync attendance to student dashboard', error)
        }
      }).catch(err => {

        console.warn('Background sync error:', err)
      })
    }
  }

  const getAttendanceStatus = (studentId) => {
    if (!currentSubject) return null
    const date = attendanceDate
    return records[date]?.[currentSubject.code]?.[studentId] || null
  }

  const updateAttendanceSummary = () => {
    if (!currentSubject) return { present: 0, absent: 0, total: 0, rate: 0 }
    
    const enrolled = enrolls[currentSubject.code] || []
    const date = attendanceDate
    const attendance = records[date]?.[currentSubject.code] || {}
    
    let present = 0
    let absent = 0
    
    enrolled.forEach(id => {
      const status = attendance[id]
      if (status === 'present') present++
      else if (status === 'absent') absent++
    })
    
    const total = enrolled.length
    const rate = total > 0 ? Math.round((present / total) * 100) : 0
    
    return { present, absent, total, rate }
  }

  const handleSelectAllPresent = () => {
    if (!currentSubject) return
    
    const date = attendanceDate
    const enrolled = enrolls[currentSubject.code] || []
    const updatedRecords = { ...records }
    if (!updatedRecords[date]) updatedRecords[date] = {}
    if (!updatedRecords[date][currentSubject.code]) updatedRecords[date][currentSubject.code] = {}
    

    enrolled.forEach(studentId => {
      updatedRecords[date][currentSubject.code][studentId] = 'present'
    })
    

    setRecords(updatedRecords)
    

    saveData(subjects, students, enrolls, alerts, updatedRecords, grades, profUid, true).then(() => {

      const formattedDate = new Date(attendanceDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      lastAutoSaveMessageRef.current = Date.now()
      addCustomAlert('success', 'Attendance Auto-Saved', `All students marked as present for ${formattedDate} and automatically saved.`, false)
    }).catch(err => 
      console.warn('Background save failed', err)
    )
  }

  const areAllStudentsPresent = () => {
    if (!currentSubject) return false
    const enrolled = enrolls[currentSubject.code] || []
    if (enrolled.length === 0) return false
    
    const date = attendanceDate
    const attendance = records[date]?.[currentSubject.code] || {}
    
    return enrolled.every(id => attendance[id] === 'present')
  }

  const handleSaveAttendance = async () => {

    try {
      if (!currentSubject) {
        console.error('? No subject selected')
        addCustomAlert('error', 'No Subject', 'Please select a subject first.', false)
        return
      }
      
      const formattedDate = new Date(attendanceDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      

      const enrolled = enrolls[currentSubject.code] || []
      const date = attendanceDate
      const dateRecords = records[date]?.[currentSubject.code] || {}
      
      if (Object.keys(dateRecords).length === 0) {
        console.warn('?? No attendance records to save')

        setToastMessage('No Record, please mark attendance before saving.')
        setTimeout(() => setToastMessage(null), 3000)
        addCustomAlert('warning', 'No Records', 'Please mark attendance for at least one student before saving.', false)
        return
      }
      


      let course = await getCourseByCode(currentSubject.code)
      if (!course) {

        const profProfile = await getProfessorByUid(profUid)
        if (!profProfile || !profProfile.id) {
          console.error('? Professor profile not found')
          addCustomAlert('error', 'Profile Error', 'Professor profile not found. Please refresh and try again.', false)
          return
        }
        const courseId = await createCourse({
          code: currentSubject.code,
          name: currentSubject.name,
          credits: parseInt(currentSubject.credits) || 0,
          professorId: profProfile.id,
        })
        course = { id: courseId, code: currentSubject.code }

      }
      const courseId = course.id

      

      let savedCount = 0
      let failedCount = 0
      const failedStudents = []
      
      const savePromises = enrolled.map(async (studentId) => {
        const status = dateRecords[studentId]
        if (status) {
          const student = findStudentById(students, studentId)
          if (student) {
            try {

              const studentData = await getStudentByNumericalId(student.id)
              if (!studentData || !studentData.id) {
                console.warn(`Student ${student.id} not found in MySQL`)
                failedCount++
                failedStudents.push(student.name || student.id)
                return
              }
              const studentMySQLId = studentData.id




              
              await setAttendanceForDate(studentMySQLId, courseId, date, status)

              savedCount++

            } catch (error) {
              failedCount++
              failedStudents.push(student.name || student.id)
              console.error(`? Failed to save attendance for student ${studentId}:`, error)
            }
          }
        }
      })
      

      await Promise.all(savePromises)
      

      const presentCount = Object.values(dateRecords).filter(s => s === 'present').length
      const absentCount = Object.values(dateRecords).filter(s => s === 'absent').length
      const totalCount = presentCount + absentCount
      

      if (savedCount > 0 && failedCount === 0) {

        setToastMessage('Attendance saved!')
        setTimeout(() => setToastMessage(null), 3000)
        addCustomAlert('success', 'Attendance Saved', `Attendance records for ${formattedDate} saved successfully. ${savedCount} student${savedCount === 1 ? '' : 's'} marked (${presentCount} present, ${absentCount} absent).`, false)

      } else if (savedCount > 0 && failedCount > 0) {
        const errorMsg = `Attendance saved for ${savedCount} student(s), but failed for ${failedCount} student(s): ${failedStudents.join(', ')}. Check console for details.`
        console.warn('?? Partial save:', errorMsg)
        addCustomAlert('warning', 'Partial Save', errorMsg, false)
      } else if (savedCount === 0) {
        const errorMsg = 'No attendance records were saved. Please check that students exist in the system and try again.'
        console.error('? No attendance saved')
        addCustomAlert('error', 'No Attendance Saved', errorMsg, false)
        return
      }
      

      if (savedCount === 0) {
        return
      }
      

      const newAlert = {
        id: Date.now(),
        type: 'attendance',
        title: 'Attendance Saved',
        message: `Attendance records for ${formattedDate} saved successfully. ${savedCount} student${savedCount === 1 ? '' : 's'} marked (${presentCount} present, ${absentCount} absent).`,
        timestamp: new Date(),
        read: false,
        target_courseId: currentSubject.code,
        subjectCode: currentSubject.code,
      }
      const updatedAlerts = [newAlert, ...alerts]
      setAlerts(updatedAlerts)
      

      await saveData(subjects, students, enrolls, updatedAlerts, records, grades, profUid, true)
    } catch (error) {
      console.error('? Error in handleSaveAttendance:', error)
      addCustomAlert('error', 'Save Failed', `Unable to save attendance: ${error.message || 'An unexpected error occurred'}. Please try again.`, false)
    }
  }



    return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-300 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'subjects'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'attendance'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'grades'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Grades
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'students'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Students
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'subjects' && (
          <SubjectsTab
            subjects={subjects}
            enrolls={enrolls}
            subjectsView={subjectsView}
            setSubjectsView={setSubjectsView}
            subjectSearchQuery={subjectSearchQuery}
            setSubjectSearchQuery={setSubjectSearchQuery}
            subjectFilterTerm={subjectFilterTerm}
            setSubjectFilterTerm={setSubjectFilterTerm}
            subjectSortBy={subjectSortBy}
            setSubjectSortBy={setSubjectSortBy}
            subjectSortOrder={subjectSortOrder}
            setSubjectSortOrder={setSubjectSortOrder}
            subjectPage={subjectPage}
            setSubjectPage={setSubjectPage}
            subjectItemsPerPage={subjectItemsPerPage}
            archivedSubjectsSearchTerm={archivedSubjectsSearchTerm}
            setArchivedSubjectsSearchTerm={setArchivedSubjectsSearchTerm}
            selectedArchivedSubjects={selectedArchivedSubjects}
            setSelectedArchivedSubjects={setSelectedArchivedSubjects}
            selectAllArchivedSubjects={selectAllArchivedSubjects}
            setSelectAllArchivedSubjects={setSelectAllArchivedSubjects}
            selectedRecycleBinSubjects={selectedRecycleBinSubjects}
            setSelectedRecycleBinSubjects={setSelectedRecycleBinSubjects}
            selectAllRecycleBinSubjects={selectAllRecycleBinSubjects}
            setSelectAllRecycleBinSubjects={setSelectAllRecycleBinSubjects}
            removedSubjects={removedSubjects}
            recycleBinSubjects={recycleBinSubjects}
            onSubjectClick={handleSubjectClick}
            onDeleteSubject={handleDeleteSubject}
            onRestoreSubject={handleRestoreSubject}
            onDeleteArchivedSubject={handleDeleteArchivedSubject}
            onRestoreFromRecycleBin={handleRestoreFromRecycleBin}
            onPermanentDeleteFromRecycleBin={handlePermanentDeleteFromRecycleBin}
            onDeleteAllArchivedSubjects={handleDeleteAllArchivedSubjects}
            onPermanentDeleteAllFromRecycleBin={handlePermanentDeleteAllFromRecycleBin}
            onPermanentDeleteSelectedFromRecycleBin={handlePermanentDeleteSelectedFromRecycleBin}
            onAddSubject={() => setShowAddSubjectModal(true)}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab
            subjects={subjects}
            enrolls={enrolls}
            students={students}
            records={records}
            currentSubject={currentSubject}
            attendanceDate={attendanceDate}
            setAttendanceDate={setAttendanceDate}
            onToggleAttendance={toggleAttendance}
            onSaveAttendance={handleSaveAttendance}
            getAttendanceStatus={getAttendanceStatus}
            updateAttendanceSummary={updateAttendanceSummary}
            onSelectAllPresent={handleSelectAllPresent}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === 'grades' && (
          <GradesTab
            subjects={subjects}
            enrolls={enrolls}
            students={students}
            grades={grades}
            currentSubject={currentSubject}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            subjects={subjects}
            enrolls={enrolls}
            records={records}
            grades={grades}
            isDarkMode={isDarkMode}
          />
        )}
        </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profName={profName}
          profPic={profPic}
          profEmail={profEmail}
          isDarkMode={isDarkMode}
        />
      )}
      {showAddSubjectModal && (
        <AddSubjectModal
          isOpen={showAddSubjectModal}
          onClose={() => setShowAddSubjectModal(false)}
          onAddSubject={handleAddSubject}
          newSubject={newSubject}
          setNewSubject={updateNewSubject}
          addSubjectError={addSubjectError}
          isSavingSubject={isSavingSubject}
          isDarkMode={isDarkMode}
        />
      )}
      {showAddStudentModal && (
        <AddStudentModal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
          students={students}
          subjects={subjects}
          enrolls={enrolls}
          onAddStudent={handleAddStudent}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}

export default Prof

