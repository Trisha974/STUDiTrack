/**
 * Custom hook for managing notification system
 * Handles notification parsing, formatting, and display logic
 */
import { useCallback } from 'react'

export function useNotifications() {
  /**
   * Categorizes notifications into academic (high priority) and administrative (low priority)
   */
  const categorizeNotifications = useCallback((notificationList) => {
    const academic = []
    const administrative = []

    notificationList.forEach(alert => {
      const title = alert.title || ''
      const message = alert.message || ''
      const type = alert.type || ''


      const isAdministrative =
        title.includes('Student Archived') ||
        title.includes('Successfully restored') ||
        title.includes('Archive') ||
        title.includes('Restore') ||
        message.includes('archived') ||
        message.includes('restored')

      if (isAdministrative) {
        administrative.push(alert)
      } else {

        academic.push(alert)
      }
    })

    return { academic, administrative }
  }, [])

  /**
   * Groups administrative notifications into a summary
   */
  const groupAdministrativeNotifications = useCallback((adminNotifications) => {
    if (adminNotifications.length === 0) return null

    const archived = adminNotifications.filter(n =>
      n.title.includes('Student Archived') || n.message.includes('archived')
    ).length

    const restored = adminNotifications.filter(n =>
      n.title.includes('Successfully restored') || n.message.includes('restored')
    ).length

    const total = adminNotifications.length
    const latestTimestamp = adminNotifications.reduce((latest, n) => {
      let timestamp = n.timestamp

      if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
        timestamp = timestamp.toDate()
      } else if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp)
      } else if (typeof timestamp === 'number') {
        timestamp = timestamp > 1e12 ? new Date(timestamp) : new Date(timestamp * 1000)
      } else if (!(timestamp instanceof Date)) {
        timestamp = new Date()
      }
      const timestampMs = timestamp instanceof Date ? timestamp.getTime() : new Date().getTime()

      return timestampMs > latest && !isNaN(timestampMs) && timestampMs > 0 ? timestampMs : latest
    }, 0)


    const validTimestamp = latestTimestamp > 0 ? new Date(latestTimestamp) : new Date()

    return {
      id: 'admin-summary',
      type: 'administrative',
      title: 'Administrative Update',
      message: `${archived > 0 ? `${archived} student(s) archived` : ''}${archived > 0 && restored > 0 ? ', ' : ''}${restored > 0 ? `${restored} student(s) restored` : ''}`,
      timestamp: validTimestamp,
      read: adminNotifications.every(n => n.read),
      count: total,
      originalNotifications: adminNotifications
    }
  }, [])

  /**
   * Extracts actionable information from notification for better display
   */
  const parseNotificationData = useCallback((alert) => {
    const title = alert.title || ''
    const message = alert.message || ''
    const type = alert.type || ''


    const studentMatch = message.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\((\d+)\)/)
    const messageCourseMatch = message.match(/([A-Z]{2,}\d{3}|[A-Z]+\s+\d+)/)
    const assignmentMatch = message.match(/submitted\s+([^f]+?)\s+for/i) ||
                           message.match(/\[([^\]]+)\]/)
    const courseCode = alert.subjectCode || messageCourseMatch?.[1] || null

    const isEnrollmentRelated = alert.type === 'subject' || alert.type === 'enrollment' || title.includes('Enrolled')

    return {
      studentName: studentMatch ? studentMatch[1] : null,
      studentId: studentMatch ? studentMatch[2] : null,
      courseCode: alert.target_courseId || alert.subjectCode || courseCode,
      assignmentName: assignmentMatch ? assignmentMatch[1] : null,
      isGradeRelated: type === 'grade' || title.includes('Grade') || message.includes('submitted') || message.includes('grading'),
      isAttendanceRelated: type === 'attendance' || title.includes('Attendance') || message.includes('absent'),
      isEnrollmentRelated,
      isContentRelated: title.includes('Material') || title.includes('Content') || message.includes('posted'),
      isDiscussionRelated: message.includes('discussion') || message.includes('replies'),
    }
  }, [])

  /**
   * Gets notification icon based on category
   */
  const getNotificationIcon = useCallback((alert, parsedData) => {
    if (parsedData.isGradeRelated) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }

    if (parsedData.isAttendanceRelated) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }

    if (parsedData.isEnrollmentRelated) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" />
        </svg>
      )
    }

    if (parsedData.isContentRelated) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }

    if (parsedData.isDiscussionRelated) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }


    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }, [])

  /**
   * Gets notification icon color classes with red/maroon theme
   */
  const getNotificationIconColor = useCallback((parsedData, isAdministrative) => {
    if (isAdministrative) {
      return 'text-slate-600 bg-slate-100 border-2 border-slate-200'
    }

    if (parsedData.isGradeRelated) {
      return 'text-red-700 bg-red-100 border-2 border-red-300'
    }

    if (parsedData.isAttendanceRelated) {
      return 'text-red-600 bg-red-50 border-2 border-red-200'
    }

    if (parsedData.isContentRelated) {
      return 'text-rose-700 bg-rose-100 border-2 border-rose-300'
    }

    if (parsedData.isDiscussionRelated) {
      return 'text-red-800 bg-red-100 border-2 border-red-400'
    }

    return 'text-[#7A1315] bg-red-50 border-2 border-red-200'
  }, [])

  /**
   * Gets notification border color class with red/maroon theme
   */
  const getNotificationBorderColor = useCallback((parsedData, isAdministrative, isRead) => {
    if (isAdministrative) {
      return isRead ? 'border-l-4 border-slate-300' : 'border-l-4 border-slate-400'
    }

    if (parsedData.isGradeRelated) {
      return isRead ? 'border-l-4 border-red-300' : 'border-l-4 border-red-600'
    }

    if (parsedData.isAttendanceRelated) {
      return isRead ? 'border-l-4 border-red-200' : 'border-l-4 border-red-500'
    }

    if (parsedData.isContentRelated) {
      return isRead ? 'border-l-4 border-rose-300' : 'border-l-4 border-rose-600'
    }

    if (parsedData.isDiscussionRelated) {
      return isRead ? 'border-l-4 border-red-400' : 'border-l-4 border-[#7A1315]'
    }

    return isRead ? 'border-l-4 border-red-200' : 'border-l-4 border-[#7A1315]'
  }, [])

  /**
   * Gets notification background color class with red/maroon theme
   */
  const getNotificationBgColor = useCallback((parsedData, isAdministrative, isRead) => {
    if (isAdministrative) {
      return isRead ? 'bg-slate-50/30' : 'bg-slate-50/60'
    }

    if (parsedData.isGradeRelated) {
      return isRead ? 'bg-red-50/30' : 'bg-red-50/60'
    }

    if (parsedData.isAttendanceRelated) {
      return isRead ? 'bg-red-50/20' : 'bg-red-50/50'
    }

    if (parsedData.isContentRelated) {
      return isRead ? 'bg-rose-50/30' : 'bg-rose-50/60'
    }

    if (parsedData.isDiscussionRelated) {
      return isRead ? 'bg-red-50/30' : 'bg-red-50/60'
    }

    return isRead ? 'bg-red-50/20' : 'bg-red-50/50'
  }, [])

  /**
   * Gets action button color classes with red/maroon theme
   */
  const getActionButtonColor = useCallback((parsedData) => {
    if (parsedData.isGradeRelated) {
      return 'text-red-700 hover:text-red-800 hover:bg-red-50'
    }

    if (parsedData.isAttendanceRelated) {
      return 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }

    if (parsedData.isContentRelated) {
      return 'text-rose-700 hover:text-rose-800 hover:bg-rose-50'
    }

    if (parsedData.isDiscussionRelated) {
      return 'text-[#7A1315] hover:text-red-900 hover:bg-red-50'
    }

    return 'text-[#7A1315] hover:text-red-800 hover:bg-red-50'
  }, [])

  /**
   * Gets title color class with red/maroon theme
   */
  const getTitleColor = useCallback((parsedData, isAdministrative) => {
    if (isAdministrative) {
      return 'text-slate-700'
    }

    if (parsedData.isGradeRelated) {
      return 'text-red-700'
    }

    if (parsedData.isAttendanceRelated) {
      return 'text-red-600'
    }

    if (parsedData.isContentRelated) {
      return 'text-rose-700'
    }

    if (parsedData.isDiscussionRelated) {
      return 'text-[#7A1315]'
    }

    return 'text-[#7A1315]'
  }, [])

  /**
   * Gets action button text and handler for professor notifications
   */
  const getNotificationAction = useCallback((alert, parsedData) => {
    return null
  }, [])

  /**
   * Formats notification title for professor (action-oriented)
   */
  const formatNotificationTitle = useCallback((alert, parsedData) => {
    if (parsedData.isGradeRelated) {
      if (alert.message.includes('submitted') || alert.message.includes('submission')) {
        return 'New Submission Received'
      }
      if (alert.message.includes('ungraded') || alert.message.includes('Grading Reminder') || alert.message.includes('deadline')) {
        return 'Grading Reminder'
      }
      return 'New Grade Posted'
    }

    if (parsedData.isAttendanceRelated) {
      return 'Attendance Alert'
    }

    if (parsedData.isEnrollmentRelated) {
      return 'Student Enrolled'
    }

    if (parsedData.isContentRelated) {
      return 'Material Released'
    }

    if (parsedData.isDiscussionRelated) {
      return 'Discussion Response'
    }

    return alert.title
  }, [])

  /**
   * Formats notification body text for professor (includes student name, course code, assignment)
   */
  const formatNotificationBody = useCallback((alert, parsedData) => {
    if (parsedData.isGradeRelated && parsedData.studentName && parsedData.assignmentName && parsedData.courseCode) {
      return `${parsedData.studentName} submitted ${parsedData.assignmentName} for ${parsedData.courseCode}`
    }

    if (parsedData.isGradeRelated && parsedData.courseCode && alert.message.includes('ungraded')) {
      const ungradedMatch = alert.message.match(/(\d+)\s+ungraded/)
      const ungradedCount = ungradedMatch ? ungradedMatch[1] : 'multiple'
      return `${ungradedCount} ungraded submissions in ${parsedData.courseCode}`
    }

    if (parsedData.isAttendanceRelated && parsedData.studentName && parsedData.courseCode) {
      const absentMatch = alert.message.match(/(\d+)\s+times?/)
      const absentCount = absentMatch ? absentMatch[1] : 'multiple'
      return `${parsedData.studentName} has missed ${absentCount} classes in ${parsedData.courseCode}`
    }

    if (parsedData.isEnrollmentRelated && alert.message) {
      return alert.message
    }

    if (parsedData.isContentRelated && parsedData.courseCode) {
      const moduleMatch = alert.message.match(/\[([^\]]+)\]/)
      const moduleName = moduleMatch ? moduleMatch[1] : 'new materials'
      return `${moduleName} materials have been released for ${parsedData.courseCode}`
    }

    if (parsedData.isDiscussionRelated && parsedData.studentName && parsedData.courseCode) {
      return `${parsedData.studentName} replied to your post in ${parsedData.courseCode}`
    }

    return alert.message
  }, [])

  /**
   * Checks if notification is high priority/urgent (for yellow border highlight)
   */
  const isUrgentNotification = useCallback((alert, parsedData) => {

    if (parsedData.isGradeRelated && (alert.message.includes('deadline') || alert.message.includes('overdue'))) {
      return true
    }


    if (parsedData.isAttendanceRelated) {
      return true
    }


    if (parsedData.isGradeRelated && alert.message.includes('due')) {
      const dateMatch = alert.message.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) {
        const dueDate = new Date(dateMatch[1])
        const now = new Date()
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
        return daysUntilDue <= 1
      }
    }

    return false
  }, [])

  /**
   * Formats timestamp as "X minutes ago" or similar
   */
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return 'Just now'

    let time

    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      time = timestamp.toDate()
    }

    else if (timestamp instanceof Date) {
      time = timestamp
    }

    else if (typeof timestamp === 'number') {

      if (timestamp <= 0) {
        return 'Just now'
      }
      time = timestamp > 1e12 ? new Date(timestamp) : new Date(timestamp * 1000)
    }

    else if (typeof timestamp === 'string') {
      const parsed = Date.parse(timestamp)
      if (!Number.isNaN(parsed) && parsed > 0) {
        time = new Date(parsed)
      }
    }


    if (!time || Number.isNaN(time.getTime()) || time.getTime() <= 0) {

      return 'Just now'
    }


    const now = new Date()
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    if (time.getTime() < 0 || time > oneYearFromNow) {
      return 'Just now'
    }


    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`

    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }, [])

  return {
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
  }
}

