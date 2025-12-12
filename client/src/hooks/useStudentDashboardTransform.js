import { useMemo } from 'react'

/**
 * Transforms MySQL data (enrollments, courses, grades, attendance) into dashboard format
 * @param {Array} enrollmentsData - Student enrollments from MySQL
 * @param {Array} coursesData - Course data from MySQL
 * @param {Array} gradesData - Grade data from MySQL
 * @param {Array} attendanceData - Attendance data from MySQL
 * @param {string} studentName - Student's name
 * @param {Array} notifications - Notifications array
 * @returns {Object} Transformed dashboard data
 */
export function transformDashboardDataFromMySQL(
    enrollmentsData,
    coursesData,
    gradesData,
    attendanceData,
    studentName,
    notifications = []
  ) {


    const courseMap = new Map()
    coursesData.forEach(course => {
      const courseId = course.id

      const courseWithProfessor = {
        ...course,
        term: course.term || 'first',
        professor_name: course.professor_name || null,
        professor_photo_url: course.professor_photo_url || null
      }
      courseMap.set(courseId, courseWithProfessor)

      if (typeof courseId === 'number') {
        courseMap.set(String(courseId), courseWithProfessor)
      } else if (typeof courseId === 'string') {
        const numId = Number(courseId)
        if (!isNaN(numId)) {
          courseMap.set(numId, courseWithProfessor)
        }
      }
    })
    

    enrollmentsData.forEach(enrollment => {
      if (enrollment.code && enrollment.course_name) {

        const courseId = enrollment.course_id
        const existsAsNumber = typeof courseId === 'number' && courseMap.has(courseId)
        const existsAsString = typeof courseId === 'string' && courseMap.has(courseId)
        const numId = typeof courseId === 'string' ? Number(courseId) : courseId
        const existsAsConverted = !isNaN(numId) && courseMap.has(numId) && courseMap.has(String(numId))
        
        if (!existsAsNumber && !existsAsString && !existsAsConverted) {
          const courseFromEnrollment = {
            id: enrollment.course_id,
            code: enrollment.code,
            name: enrollment.course_name,
            credits: enrollment.credits || 0
          }
          courseMap.set(enrollment.course_id, courseFromEnrollment)

          if (typeof enrollment.course_id === 'number') {
            courseMap.set(String(enrollment.course_id), courseFromEnrollment)
          } else {
            const numId = Number(enrollment.course_id)
            if (!isNaN(numId)) {
              courseMap.set(numId, courseFromEnrollment)
            }
          }
        }
      }
    })


    const enrollmentMap = new Map()
    enrollmentsData.forEach(enrollment => {
      enrollmentMap.set(enrollment.course_id, enrollment)
    })


    const gradesByCourse = new Map()
    gradesData.forEach(grade => {
      const courseId = grade.course_id

      if (!gradesByCourse.has(courseId)) {
        gradesByCourse.set(courseId, [])
      }
      gradesByCourse.get(courseId).push(grade)
      

      if (typeof courseId === 'number') {
        if (!gradesByCourse.has(String(courseId))) {
          gradesByCourse.set(String(courseId), [])
        }
        gradesByCourse.get(String(courseId)).push(grade)
      } else if (typeof courseId === 'string') {
        const numId = Number(courseId)
        if (!isNaN(numId)) {
          if (!gradesByCourse.has(numId)) {
            gradesByCourse.set(numId, [])
          }
          gradesByCourse.get(numId).push(grade)
        }
      }
    })
    


    const attendanceByCourse = new Map()
    attendanceData.forEach(att => {
      const courseId = att.course_id

      if (!attendanceByCourse.has(courseId)) {
        attendanceByCourse.set(courseId, [])
      }
      attendanceByCourse.get(courseId).push(att)
      

      if (typeof courseId === 'number') {
        if (!attendanceByCourse.has(String(courseId))) {
          attendanceByCourse.set(String(courseId), [])
        }
        attendanceByCourse.get(String(courseId)).push(att)
      } else if (typeof courseId === 'string') {
        const numId = Number(courseId)
        if (!isNaN(numId)) {
          if (!attendanceByCourse.has(numId)) {
            attendanceByCourse.set(numId, [])
          }
          attendanceByCourse.get(numId).push(att)
        }
      }
    })


    let totalAbsences = 0
    let totalExams = 0
    let examsTaken = 0
    let totalScore = 0
    let totalMax = 0
    let totalPresent = 0
    let totalSessions = 0


    

    const processEnrollment = (enrollment) => {

      let course = courseMap.get(enrollment.course_id)
      

      if (!course) {
        course = courseMap.get(Number(enrollment.course_id)) || courseMap.get(String(enrollment.course_id))
      }
      


      if (!course && enrollment.code && enrollment.course_name) {
        course = {
          id: enrollment.course_id,
          code: enrollment.code,
          name: enrollment.course_name,
          credits: enrollment.credits || 0,
          term: enrollment.term || 'first',
          professor_id: enrollment.professor_id,
          professor_name: enrollment.professor_name,
          professor_photo_url: enrollment.professor_photo_url
        }

        courseMap.set(enrollment.course_id, course)
        if (typeof enrollment.course_id === 'number') {
          courseMap.set(String(enrollment.course_id), course)
        } else {
          const numId = Number(enrollment.course_id)
          if (!isNaN(numId)) {
            courseMap.set(numId, course)
          }
        }
      }
      
      if (!course) {
        console.warn('⚠️ Course not found for enrollment:', {
          enrollmentId: enrollment.id,
          courseId: enrollment.course_id,
          courseIdType: typeof enrollment.course_id,
          availableCourseIds: Array.from(courseMap.keys()),
          enrollmentHasCourseData: !!(enrollment.code && enrollment.course_name),
          enrollmentData: enrollment
        })
        return null
      }
      


      let courseGrades = gradesByCourse.get(course.id) || []
      if (courseGrades.length === 0) {

        if (typeof course.id === 'number') {
          courseGrades = gradesByCourse.get(String(course.id)) || []
        } else if (typeof course.id === 'string') {
          const numId = Number(course.id)
          if (!isNaN(numId)) {
            courseGrades = gradesByCourse.get(numId) || []
          }
        }
      }
      

      let courseAttendance = attendanceByCourse.get(course.id) || []
      if (courseAttendance.length === 0) {
        if (typeof course.id === 'number') {
          courseAttendance = attendanceByCourse.get(String(course.id)) || []
        } else if (typeof course.id === 'string') {
          const numId = Number(course.id)
          if (!isNaN(numId)) {
            courseAttendance = attendanceByCourse.get(numId) || []
          }
        }
      }
      


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


      let courseTerm = course.term || enrollment.term || 'first'

      if (typeof courseTerm === 'string') {
        courseTerm = courseTerm.toLowerCase().trim()
      }

      if (courseTerm !== 'first' && courseTerm !== 'second') {
        courseTerm = 'first'
      }
      

      return {
        id: course.code.split(' ')[0] || course.code,
        code: course.code,
        name: course.name || course.code,
        term: courseTerm,
        grade: subjectGrade,
        attRate: subjectAttRate,
        present: subjectPresent,
        abs: subjectAbsent,
        exams: subjectExams.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
        attendanceRecords: subjectAttendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date)),
        instructor: {
          name: course.professor_name || enrollment.professor_name || 'TBA',
          photo_url: course.professor_photo_url || enrollment.professor_photo_url || null,
          email: '',
          schedule: 'TBA',
        },
      }
    }
    

    const processedSubjects = enrollmentsData.map(processEnrollment).filter(Boolean)
    


    const firstTerm = processedSubjects.filter(subject => {
      let term = subject.term || 'first'
      if (typeof term === 'string') {
        term = term.toLowerCase().trim()
      }
      return term === 'first' || !term || term === null || term === undefined
    })
    
    const secondTerm = processedSubjects.filter(subject => {
      let term = subject.term || 'first'
      if (typeof term === 'string') {
        term = term.toLowerCase().trim()
      }
      return term === 'second'
    })


    if (enrollmentsData.length > 0 && firstTerm.length === 0) {
      console.warn('⚠️ WARNING: Enrollments exist but no subjects were created!', {
        enrollmentsCount: enrollmentsData.length,
        enrollments: enrollmentsData.map(e => ({
          id: e.id,
          course_id: e.course_id,
          hasCode: !!e.code,
          hasCourseName: !!e.course_name,
          code: e.code,
          course_name: e.course_name
        })),
        coursesDataCount: coursesData.length,
        courseMapSize: courseMap.size
      })
    }

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
      secondTerm: Array.isArray(secondTerm) ? secondTerm : [],
      notifs: notifications,
    }
    
    return result
}

/**
 * Custom hook for transforming MySQL student data into dashboard format
 * Extracted from Student.jsx to improve maintainability and reusability
 */
export function useStudentDashboardTransform() {
  /**
   * Calculates dashboard statistics from transformed subject data (fallback method)
   * @param {Object} data - Transformed dashboard data with firstTerm and secondTerm
   * @returns {Object} Statistics object
   */
  const calculateDashboardStatisticsFallback = (data) => {
    let absences = 0
    let examsCompleted = 0
    let totalExams = 0
    let attendancePresent = 0
    let attendanceSessions = 0
    let totalScore = 0
    let totalMaxPoints = 0

    const allSubjects = [
      ...(Array.isArray(data?.firstTerm) ? data.firstTerm : []),
      ...(Array.isArray(data?.secondTerm) ? data.secondTerm : []),
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

  /**
   * Calculates real-time statistics from MySQL data or transformed data
   * @param {Object} data - Transformed dashboard data
   * @param {Array} liveGrades - Live grade data from MySQL
   * @param {Array} liveAttendance - Live attendance data from MySQL
   * @returns {Object} Statistics object
   */
  const calculateRealTimeStatistics = (data, liveGrades = [], liveAttendance = []) => {

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

    const fallbackStats = calculateDashboardStatisticsFallback(data || {})

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

  return {
    transformDashboardDataFromMySQL,
    calculateDashboardStatisticsFallback,
    calculateRealTimeStatistics,
  }
}

