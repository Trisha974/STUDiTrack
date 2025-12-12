/**
 * Custom hook for managing professor dashboard data
 */
import { useState, useCallback, useRef } from 'react'
import { getWithBackup, setWithBackup } from '../services/firestoreWithBackup'
import { DASHBOARD_COLLECTION, TIMEOUTS } from '../constants/appConstants'

export function useProfessorData(profUid) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const saveDataTimeoutRef = useRef(null)
  const pendingSaveRef = useRef(null)

  const loadData = useCallback(async (uid) => {
    if (!uid) return null
    
    setIsLoading(true)
    setError(null)
    try {
      const data = await getWithBackup(DASHBOARD_COLLECTION, uid)
      return data || {
        subjects: [],
        students: [],
        enrolls: {},
        alerts: [],
        records: {},
        grades: {}
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveData = useCallback(async (data, immediate = false) => {
    if (!profUid) {
      throw new Error('Cannot save data: No UID available')
    }
    
    const payload = {
      ...data,
      ownerUid: profUid,
      updatedAt: new Date().toISOString()
    }
    
    pendingSaveRef.current = { payload, uidToUse: profUid }
    
    if (immediate) {
      if (saveDataTimeoutRef.current) {
        clearTimeout(saveDataTimeoutRef.current)
        saveDataTimeoutRef.current = null
      }
      return await executeSave(payload, profUid)
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
    }, TIMEOUTS.SAVE_DEBOUNCE)
  }, [profUid])

  const executeSave = useCallback(async (payload, uidToUse) => {
    try {
      const success = await setWithBackup(DASHBOARD_COLLECTION, uidToUse, payload, { forceWrite: true })
      if (success) {
        console.log('✅ Data saved successfully')
      } else {
        console.log('⚠️ Data saved to localStorage backup')
      }
      return success
    } catch (err) {
      console.error('Failed to save data:', err)
      throw err
    }
  }, [])

  return {
    isLoading,
    error,
    loadData,
    saveData
  }
}

