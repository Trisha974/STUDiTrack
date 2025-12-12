import { useCallback, useRef } from 'react'
import { setWithBackup } from '../services/firestoreWithBackup'
import { getCurrentUserUid } from '../utils/authHelpers'
import { DASHBOARD_COLLECTION } from '../constants/appConstants'

/**
 * Hook for Prof.jsx data saving logic
 * Extracts saveData and executeSave functions to reduce Prof.jsx size
 */
export function useProfDataSaving({
  profUid,
  subjects,
  removedSubjects,
  students,
  enrolls,
  alerts,
  records,
  grades,
  addCustomAlert
}) {

  const saveDataTimeoutRef = useRef(null)
  const pendingSaveRef = useRef(null)


  const executeSave = useCallback(async (payload, uidToUse) => {
    try {


      const normalizedPayload = {
        ...payload
      }
      





      const success = await setWithBackup(DASHBOARD_COLLECTION, uidToUse, normalizedPayload, { forceWrite: true })
      if (success) {

      } else {

      }
      return success
    } catch (e) {
      console.error('Failed to save professor dashboard data', e)

      if (e.code === 'resource-exhausted' || e.message?.includes('quota') || e.message?.includes('Quota')) {
        console.error('⚠️ Firestore quota exceeded! Please check Firebase Console or wait for daily reset.')
        if (addCustomAlert) {
          addCustomAlert('error', 'Quota Exceeded', 'Firestore quota has been exceeded. Data will be saved when quota resets (daily at midnight Pacific Time).', false)
        }
      }
      throw e
    }
  }, [addCustomAlert])

  const saveData = useCallback(async (subjectsData, studentsData, enrollsData, alertsData, recordsData, gradesData, uidOverride = null, immediate = false) => {


    let uidToUse = uidOverride || profUid


    uidToUse = await getCurrentUserUid(uidOverride || profUid)
    
    if (!uidToUse) {
      const error = new Error('Cannot save data: No UID available')
      console.error(error.message)
      throw error
    }
    



    const payload = {
      subjects: subjectsData ?? subjects,
      removedSubjects: removedSubjects,
      students: studentsData ?? students,

      alerts: alertsData ?? alerts,
      records: recordsData ?? records,
      grades: gradesData ?? grades,
      ownerUid: uidToUse,
      updatedAt: new Date().toISOString(),
    }
    

    pendingSaveRef.current = { payload, uidToUse }
    

    if (immediate) {
      if (saveDataTimeoutRef.current) {
        clearTimeout(saveDataTimeoutRef.current)
        saveDataTimeoutRef.current = null
      }
      const result = await executeSave(payload, uidToUse)
      return result
    }
    

    if (saveDataTimeoutRef.current) {
      clearTimeout(saveDataTimeoutRef.current)
    }
    


    saveDataTimeoutRef.current = setTimeout(async () => {
      if (pendingSaveRef.current) {
        await executeSave(pendingSaveRef.current.payload, pendingSaveRef.current.uidToUse)
        pendingSaveRef.current = null
      }
      saveDataTimeoutRef.current = null
    }, 10000)
  }, [subjects, removedSubjects, students, enrolls, alerts, records, grades, profUid, executeSave])

  return {
    saveData,
    executeSave
  }
}

