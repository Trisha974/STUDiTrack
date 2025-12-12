/**
 * Hook for Student.jsx utility functions
 * Extracts utility functions to reduce Student.jsx size
 */
export function useStudentUtilities() {

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


  const getExamBreakdown = (data) => {
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


  const getAbsencesBreakdown = (data) => {
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


  const getAttendanceBreakdown = (data) => {
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


  const getGradeBreakdown = (data) => {
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


  const getNotificationIcon = (notification) => {
    const type = notification.type || ''
    const title = notification.title || ''
    

    if (type === 'attendance' || title.includes('Attendance')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    

    if (type === 'grade' || title.includes('Grade')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
    

    if (title.includes('Subject')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
    

    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }


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


  const getInitials = (name) => {
    if (!name) return '??'
    return name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  }

  return {
    getGradeColor,
    getGradeBg,
    getExamBreakdown,
    getAbsencesBreakdown,
    getAttendanceBreakdown,
    getGradeBreakdown,
    getNotificationIcon,
    getNotificationIconColor,
    getInitials
  }
}

