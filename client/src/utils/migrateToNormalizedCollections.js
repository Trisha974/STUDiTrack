

import { db } from '../firebase'
import { collection, getDocs, doc, getDoc, setDoc, addDoc } from 'firebase/firestore'
import { createCourse } from '../services/courses'
import { createEnrollment } from '../services/enrollments'
import { createGrade } from '../services/grades'
import { setAttendanceForDate } from '../services/attendance'
import { getStudentByNumericalId } from '../services/students'
import { getCourseByCode } from '../services/courses'

export async function migrateProfessorDashboard(professorUid) {
  if (!professorUid) {
    throw new Error('Professor UID is required')
  }

  const summary = {
    coursesCreated: 0,
    enrollmentsCreated: 0,
    gradesCreated: 0,
    attendanceCreated: 0,
    errors: [],
  }

  try {

    const profDashboardRef = doc(db, 'professorDashboards', professorUid)
    const profDashboardSnap = await getDoc(profDashboardRef)

    if (!profDashboardSnap.exists()) {
      console.warn(`No professor dashboard found for ${professorUid}`)
      return summary
    }

    const profData = profDashboardSnap.data()
    const { subjects = [], students = [], enrolls = {}, records = {}, grades = {} } = profData

const courseIdMap = {}

    for (const subject of subjects) {
      try {

        let existingCourse = await getCourseByCode(subject.code)

        if (!existingCourse) {
          const courseId = await createCourse({
            code: subject.code,
            name: subject.name,
            credits: subject.credits || '0',
            professorId: professorUid,
          })
          courseIdMap[subject.code] = courseId
          summary.coursesCreated++
          console.log(`Created course: ${subject.name} (${subject.code})`)
        } else {
          courseIdMap[subject.code] = existingCourse.id
          console.log(`Course already exists: ${subject.name} (${subject.code})`)
        }
      } catch (error) {
        summary.errors.push(`Error creating course ${subject.code}: ${error.message}`)
        console.error(`Error creating course ${subject.code}:`, error)
      }
    }

for (const [subjectCode, studentIds] of Object.entries(enrolls)) {
      const courseId = courseIdMap[subjectCode]
      if (!courseId) {
        summary.errors.push(`Course ID not found for ${subjectCode}`)
        continue
      }

      for (const studentLocalId of studentIds) {
        try {

          const student = students.find(s => s.id === studentLocalId)
          if (!student) {
            summary.errors.push(`Student not found: ${studentLocalId}`)
            continue
          }

const studentDoc = await getStudentByNumericalId(studentLocalId)
          if (!studentDoc) {
            summary.errors.push(`Student document not found for ID: ${studentLocalId}`)
            continue
          }

          const studentUid = studentDoc.id

await createEnrollment(studentUid, courseId, {
            studentNumber: studentLocalId,
            studentName: student.name,
            studentEmail: student.email,
            courseCode: subjectCode,
            courseName: subjects.find(sub => sub.code === subjectCode)?.name || subjectCode,
            professorId: professorUid,
          })
          summary.enrollmentsCreated++
          console.log(`Created enrollment: Student ${studentLocalId} → Course ${subjectCode}`)
        } catch (error) {
          summary.errors.push(`Error creating enrollment for ${studentLocalId} in ${subjectCode}: ${error.message}`)
          console.error(`Error creating enrollment:`, error)
        }
      }
    }

for (const [subjectCode, subjectGrades] of Object.entries(grades)) {
      const courseId = courseIdMap[subjectCode]
      if (!courseId) continue

      for (const [assessmentType, assessments] of Object.entries(subjectGrades)) {
        if (!Array.isArray(assessments)) continue

        for (const assessment of assessments) {
          if (!assessment.scores || typeof assessment.scores !== 'object') continue

          for (const [studentLocalId, score] of Object.entries(assessment.scores)) {
            try {

              const studentDoc = await getStudentByNumericalId(studentLocalId)
              if (!studentDoc) continue

              const studentUid = studentDoc.id

await createGrade({
                studentId: studentUid,
                courseId: courseId,
                assessmentType: assessmentType,
                assessmentTitle: assessment.title || 'Untitled',
                score: score,
                maxPoints: assessment.maxPoints || 100,
                date: assessment.date || new Date().toISOString(),
              })
              summary.gradesCreated++
            } catch (error) {
              summary.errors.push(`Error creating grade: ${error.message}`)
              console.error(`Error creating grade:`, error)
            }
          }
        }
      }
    }

for (const [date, dateRecords] of Object.entries(records)) {
      for (const [subjectCode, subjectRecords] of Object.entries(dateRecords)) {
        const courseId = courseIdMap[subjectCode]
        if (!courseId) continue

        for (const [studentLocalId, status] of Object.entries(subjectRecords)) {
          try {

            const studentDoc = await getStudentByNumericalId(studentLocalId)
            if (!studentDoc) continue

            const studentUid = studentDoc.id

await setAttendanceForDate(studentUid, courseId, date, status)
            summary.attendanceCreated++
          } catch (error) {
            summary.errors.push(`Error creating attendance: ${error.message}`)
            console.error(`Error creating attendance:`, error)
          }
        }
      }
    }

    console.log('Migration completed:', summary)
    return summary
  } catch (error) {
    console.error('Migration failed:', error)
    summary.errors.push(`Migration failed: ${error.message}`)
    return summary
  }
}

export async function migrateAllProfessorDashboards() {
  const profDashboardsRef = collection(db, 'professorDashboards')
  const snap = await getDocs(profDashboardsRef)

  const results = []
  for (const docSnap of snap.docs) {
    const professorUid = docSnap.id
    console.log(`Migrating professor dashboard: ${professorUid}`)
    const result = await migrateProfessorDashboard(professorUid)
    results.push({ professorUid, ...result })
  }

  return results
}

