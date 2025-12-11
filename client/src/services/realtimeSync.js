

import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const DASHBOARD_COLLECTION = 'professorDashboards'
const STUDENT_DASHBOARD_COLLECTION = 'studentDashboards'

const UPDATE_THROTTLE_MS = 60000

function isRealtimeDisabled() {
  try {
    return localStorage.getItem('disableRealtimeUpdates') === 'true' ||
           process.env.REACT_APP_DISABLE_REALTIME === 'true'
  } catch {
    return false
  }
}

export function subscribeToProfessorDashboard(professorUid, onUpdate) {
  if (!professorUid) {
    console.warn('Cannot subscribe to professor dashboard: No UID provided')
    return () => {}
  }

if (isRealtimeDisabled()) {
    console.warn('⚠️ Real-time updates disabled to reduce Firestore quota usage')
    return () => {}
  }

  const docRef = doc(db, DASHBOARD_COLLECTION, professorUid)
  let lastUpdateTime = 0
  let lastDataHash = null

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {

      const now = Date.now()
      if (now - lastUpdateTime < UPDATE_THROTTLE_MS) {
        return
      }

      if (snapshot.exists()) {
        const data = snapshot.data()

const criticalFieldsHash = JSON.stringify({
          updatedAt: data.updatedAt,

          alertsCount: (data.alerts || []).length,
          alertsLatestId: (data.alerts || [])[0]?.id || null,

          enrollsKeys: Object.keys(data.enrolls || {}).sort().join(','),
          enrollsTotal: Object.values(data.enrolls || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0),

          subjectsCount: (data.subjects || []).length,
          studentsCount: (data.students || []).length,
        })

        if (criticalFieldsHash === lastDataHash) {

          return
        }

const minimalData = {
          subjects: data.subjects || [],
          removedSubjects: data.removedSubjects || [],
          students: data.students || [],
          enrolls: data.enrolls || {},
          alerts: data.alerts || [],

updatedAt: data.updatedAt,
          ownerUid: data.ownerUid,
        }

        lastDataHash = criticalFieldsHash
        lastUpdateTime = now

        console.log('Professor dashboard updated in real-time (minimal data):', {
          subjects: minimalData.subjects.length,
          students: minimalData.students.length,
          alerts: minimalData.alerts.length,
          enrolls: Object.keys(minimalData.enrolls).length,
          updatedAt: minimalData.updatedAt,
        })
        onUpdate(minimalData)
      } else {
        console.warn('Professor dashboard document does not exist')
        onUpdate(null)
      }
    },
    (error) => {
      console.error('Error listening to professor dashboard:', error)

      if (error.code === 'resource-exhausted' || error.message?.includes('quota') || error.message?.includes('Quota')) {
        console.warn('💡 Tip: Disable real-time updates to reduce quota usage: localStorage.setItem("disableRealtimeUpdates", "true")')
      }
    }
  )

  return unsubscribe
}

export function subscribeToStudentDashboard(studentUid, onUpdate) {
  if (!studentUid) {
    console.warn('Cannot subscribe to student dashboard: No UID provided')
    return () => {}
  }

if (isRealtimeDisabled()) {
    console.warn('⚠️ Real-time updates disabled to reduce Firestore quota usage')
    return () => {}
  }

  const docRef = doc(db, STUDENT_DASHBOARD_COLLECTION, studentUid)
  let lastUpdateTime = 0
  let lastDataHash = null

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {

      const now = Date.now()
      if (now - lastUpdateTime < UPDATE_THROTTLE_MS) {
        return
      }

      if (snapshot.exists()) {
        const data = snapshot.data()

const criticalFieldsHash = JSON.stringify({
          updatedAt: data.updatedAt,
          subjectsCount: (data.subjects || []).length,

          gradesKeys: Object.keys(data.grades || {}).sort().join(','),
        })

        if (criticalFieldsHash === lastDataHash) {

          return
        }

const minimalData = {
          subjects: data.subjects || [],
          grades: data.grades || {},
          updatedAt: data.updatedAt,
          ownerUid: data.ownerUid,

        }

        lastDataHash = criticalFieldsHash
        lastUpdateTime = now

        console.log('Student dashboard updated in real-time (minimal data):', {
          subjects: minimalData.subjects.length,
          grades: Object.keys(minimalData.grades).length,
          updatedAt: minimalData.updatedAt,
        })
        onUpdate(minimalData)
      } else {
        console.warn('Student dashboard document does not exist')
        onUpdate(null)
      }
    },
    (error) => {
      console.error('Error listening to student dashboard:', error)

      if (error.code === 'resource-exhausted' || error.message?.includes('quota') || error.message?.includes('Quota')) {
        console.warn('💡 Tip: Disable real-time updates to reduce quota usage: localStorage.setItem("disableRealtimeUpdates", "true")')
      }
    }
  )

  return unsubscribe
}

export function detectDateChanges(oldData, newData) {
  if (!oldData || !newData) return []

  const changes = []
  const oldGrades = oldData.grades || {}
  const newGrades = newData.grades || {}

Object.keys(newGrades).forEach(subjectCode => {
    const oldSubjectGrades = oldGrades[subjectCode] || {}
    const newSubjectGrades = newGrades[subjectCode] || {}

    Object.keys(newSubjectGrades).forEach(assessmentType => {
      const oldAssessments = oldSubjectGrades[assessmentType] || []
      const newAssessments = newSubjectGrades[assessmentType] || []

newAssessments.forEach((newAssessment, index) => {
        const oldAssessment = oldAssessments[index]

        if (!oldAssessment && newAssessment.dueDate) {
          changes.push({
            type: 'added',
            subjectCode,
            assessmentType,
            assessmentTitle: newAssessment.title,
            dueDate: newAssessment.dueDate,
          })
        } else if (oldAssessment && newAssessment.dueDate !== oldAssessment.dueDate) {
          changes.push({
            type: 'updated',
            subjectCode,
            assessmentType,
            assessmentTitle: newAssessment.title,
            oldDueDate: oldAssessment.dueDate,
            newDueDate: newAssessment.dueDate,
          })
        }
      })

if (oldAssessments.length > newAssessments.length) {
        oldAssessments.slice(newAssessments.length).forEach(deletedAssessment => {
          if (deletedAssessment.dueDate) {
            changes.push({
              type: 'deleted',
              subjectCode,
              assessmentType,
              assessmentTitle: deletedAssessment.title,
              dueDate: deletedAssessment.dueDate,
            })
          }
        })
      }
    })
  })

  return changes
}

