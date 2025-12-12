import { useCallback, useState } from 'react'
import { getWithBackup, setWithBackup } from '../services/firestoreWithBackup'
import { migrateDashboardData } from '../utils/migrations/studentIdMigration'
import { normalizeStudentId, normalizeEnrollsMap } from '../utils/validationHelpers'
import { DASHBOARD_COLLECTION } from '../constants/appConstants'

/**
 * Hook for Prof.jsx data loading logic
 * Extracts loadData function to reduce Prof.jsx size
 */
export function useProfDataLoading({
  setSubjects,
  setStudents,
  setNormalizedEnrolls,
  setRecords,
  setGrades,
  setRemovedSubjects,
  setRecycleBinSubjects,
  setIsLoading,
  setRefreshTrigger
}) {
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
        


        const finalEnrolls = {}
        Object.keys(migrated.enrolls || {}).forEach(subjectCode => {
          const enrolledIds = migrated.enrolls[subjectCode] || []

          const activeEnrolledIds = enrolledIds.filter(id => {
            const normalizedId = normalizeStudentId(id)
            return studentsWithArchived.some(s => normalizeStudentId(s.id) === normalizedId && !s.archived)
          })
          if (activeEnrolledIds.length > 0) {
            finalEnrolls[subjectCode] = activeEnrolledIds
          }
        })
        

        setSubjects(migrated.subjects || [])
        setStudents(studentsWithArchived)
        setNormalizedEnrolls(finalEnrolls)
        setRecords(migrated.records || {})
        setGrades(migrated.grades || {})
        setRemovedSubjects(migrated.removedSubjects || [])
        setRecycleBinSubjects(migrated.recycleBinSubjects || [])
        

        setRefreshTrigger(prev => prev + 1)
        
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
        console.error('⚠️ Firestore quota exceeded!')
        console.error('⚠️ To reduce quota usage, disable real-time updates:')
        console.error('   localStorage.setItem("disableRealtimeUpdates", "true")')
        console.error('⚠️ Or upgrade to Blaze plan for higher limits')
      }
      
      setIsLoading(false)
      return false
    }
  }, [setSubjects, setStudents, setNormalizedEnrolls, setRecords, setGrades, setRemovedSubjects, setRecycleBinSubjects, setIsLoading, setRefreshTrigger])

  return {
    loadData
  }
}

