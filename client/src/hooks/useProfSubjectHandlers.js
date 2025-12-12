import { useCallback } from 'react'
import { getCourseByCode, deleteCourse } from '../services/courses'
import { getEnrollmentsByCourse, deleteEnrollment } from '../services/enrollments'
import { setWithBackup } from '../services/firestoreWithBackup'
import { DASHBOARD_COLLECTION } from '../constants/appConstants'

/**
 * Hook for Prof.jsx subject management handlers
 * Extracts subject deletion, restoration, and permanent delete handlers (~500 lines)
 */
export function useProfSubjectHandlers({
  subjects,
  removedSubjects,
  recycleBinSubjects,
  students,
  enrolls,
  alerts,
  records,
  grades,
  profUid,
  profProfile,
  buildEnrollsFromMySQL,
  setSubjects,
  setRemovedSubjects,
  setRecycleBinSubjects,
  setNormalizedEnrolls,
  setAlerts,
  setSelectedSubject,
  setShowSubjectDetail,
  setSubjectPendingDelete,
  setDeleteSubjectMode,
  setShowDeleteSubjectModal,
  setSelectedRecycleBinSubjects,
  setSelectAllRecycleBinSubjects,
  addCustomAlert
}) {
  const handleDeleteSubject = useCallback(async (subjectCode, e) => {
    e.stopPropagation()
    const subject = subjects.find(s => s.code === subjectCode)
    if (!subject) return
    
    setSubjectPendingDelete(subject)
    setDeleteSubjectMode('archive')
    setShowDeleteSubjectModal(true)
  }, [subjects, setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  const handleRestoreSubject = useCallback(async (subjectCode) => {
    const subject = removedSubjects.find(s => s.code === subjectCode)
    if (!subject) return
    
    const updatedRemovedSubjects = removedSubjects.filter(s => s.code !== subjectCode)
    const updatedSubjects = [...subjects, subject]
    
    setSubjects(updatedSubjects)
    setRemovedSubjects(updatedRemovedSubjects)
    

    try {
      if (profProfile && profProfile.id) {
        const rebuiltResult = await buildEnrollsFromMySQL(profProfile.id, updatedSubjects)
        const rebuiltEnrolls = rebuiltResult.enrolls || rebuiltResult
        setNormalizedEnrolls(rebuiltEnrolls)
        
        const payload = {
          subjects: updatedSubjects,
          removedSubjects: updatedRemovedSubjects,
          students: students,
          enrolls: rebuiltEnrolls,
          alerts,
          records: records,
          grades: grades,
          ownerUid: profUid,
          updatedAt: new Date().toISOString(),
        }
        
        try {
          await setWithBackup(DASHBOARD_COLLECTION, profUid, payload, { forceWrite: true })
        } catch (error) {
          console.error('Failed to save restored subject', error)
        }
      } else {
        console.warn('⚠️ Professor MySQL ID not available; cannot rebuild enrollments from MySQL')
        const payload = {
          subjects: updatedSubjects,
          removedSubjects: updatedRemovedSubjects,
          students: students,
          enrolls: enrolls,
          alerts,
          records: records,
          grades: grades,
          ownerUid: profUid,
          updatedAt: new Date().toISOString(),
        }
        
        try {
          await setWithBackup(DASHBOARD_COLLECTION, profUid, payload, { forceWrite: true })
        } catch (error) {
          console.error('Failed to save restored subject', error)
        }
      }
    } catch (error) {
      console.error('⚠️ Failed to rebuild enrollments from MySQL:', error)
      const payload = {
        subjects: updatedSubjects,
        removedSubjects: updatedRemovedSubjects,
        students: students,
        enrolls: enrolls,
        alerts,
        records: records,
        grades: grades,
        ownerUid: profUid,
        updatedAt: new Date().toISOString(),
      }
      
      try {
        await setWithBackup(DASHBOARD_COLLECTION, profUid, payload, { forceWrite: true })
      } catch (error) {
        console.error('Failed to save restored subject', error)
      }
    }
  }, [subjects, removedSubjects, students, enrolls, alerts, records, grades, profUid, profProfile, buildEnrollsFromMySQL, setSubjects, setRemovedSubjects, setNormalizedEnrolls])

  const handleDeleteArchivedSubject = useCallback(async (subjectCode) => {
    const subject = removedSubjects.find(s => s.code === subjectCode)
    if (!subject) return

    setSubjectPendingDelete(subject)
    setDeleteSubjectMode('delete')
    setShowDeleteSubjectModal(true)
  }, [removedSubjects, setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  const handleDeleteAllArchivedSubjects = useCallback(() => {
    setSubjectPendingDelete({ code: 'ALL', name: 'All Archived Subjects', isBulkDelete: true })
    setDeleteSubjectMode('delete')
    setShowDeleteSubjectModal(true)
  }, [setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  const handlePermanentDeleteAllFromRecycleBin = useCallback(() => {
    setSubjectPendingDelete({ code: 'ALL', name: 'All Recycle Bin Subjects', isBulkDelete: true })
    setDeleteSubjectMode('permanent')
    setShowDeleteSubjectModal(true)
  }, [setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  const handlePermanentDeleteSelectedFromRecycleBin = useCallback(() => {
    if (selectedRecycleBinSubjects.length === 0) {
      addCustomAlert('warning', 'No Selection', 'Please select at least one subject to permanently delete.', false)
      return
    }
    
    setSubjectPendingDelete({ 
      code: 'SELECTED', 
      name: `${selectedRecycleBinSubjects.length} Selected Subject(s)`, 
      isBulkDelete: true,
      selectedCodes: selectedRecycleBinSubjects
    })
    setDeleteSubjectMode('permanent')
    setShowDeleteSubjectModal(true)
  }, [selectedRecycleBinSubjects, setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal, addCustomAlert])

  const confirmArchiveSubject = useCallback(async () => {
    const subject = subjectPendingDelete
    if (!subject) return
    const subjectCode = subject.code


    try {
      const course = await getCourseByCode(subjectCode)
      if (course && course.id) {
        const enrollments = await getEnrollmentsByCourse(course.id)
        

        for (const enrollment of enrollments) {
          try {
            await deleteEnrollment(enrollment.id)
          } catch (error) {
            console.error(`Failed to delete enrollment ${enrollment.id}:`, error)
          }
        }
      } else {
        console.warn(`⚠️ Course ${subjectCode} not found in MySQL; skipping enrollment deletion`)
      }
    } catch (error) {
      console.error('⚠️ Failed to delete enrollments from MySQL:', error)
    }

    const updatedSubjects = subjects.filter(s => s.code !== subjectCode)
    const updatedRemovedSubjects = [...removedSubjects, subject]
    const updatedEnrolls = { ...enrolls }
    delete updatedEnrolls[subjectCode]
    
    setSubjects(updatedSubjects)
    setRemovedSubjects(updatedRemovedSubjects)
    setNormalizedEnrolls(updatedEnrolls)
    
    const payload = {
      subjects: updatedSubjects,
      removedSubjects: updatedRemovedSubjects,
      students: students,
      enrolls: updatedEnrolls,
      alerts,
      records: records,
      grades: grades,
      ownerUid: profUid,
      updatedAt: new Date().toISOString(),
    }
    
    try {
      await setWithBackup(DASHBOARD_COLLECTION, profUid, payload, { forceWrite: true })
    } catch (error) {
      console.error('Failed to save removed subject', error)
    }
    
    if (selectedSubject && selectedSubject.code === subjectCode) {
      setShowSubjectDetail(false)
      setSelectedSubject(null)
    }

    setShowDeleteSubjectModal(false)
    setSubjectPendingDelete(null)
    setDeleteSubjectMode('delete')
  }, [subjectPendingDelete, subjects, removedSubjects, enrolls, students, alerts, records, grades, profUid, selectedSubject, setSubjects, setRemovedSubjects, setNormalizedEnrolls, setShowSubjectDetail, setSelectedSubject, setShowDeleteSubjectModal, setSubjectPendingDelete, setDeleteSubjectMode])

  const confirmPermanentDelete = useCallback(async () => {
    const subject = subjectPendingDelete
    if (!subject) return


    if (subject.isBulkDelete) {
      let subjectsToDelete = []
      
      if (subject.code === 'ALL') {
        subjectsToDelete = [...recycleBinSubjects]
      } else if (subject.code === 'SELECTED' && subject.selectedCodes) {
        subjectsToDelete = recycleBinSubjects.filter(s => subject.selectedCodes.includes(s.code))
      } else {
        subjectsToDelete = [subject]
      }
      

      for (const subj of subjectsToDelete) {
        try {
          const course = await getCourseByCode(subj.code)
          if (course && course.id) {
            await deleteCourse(course.id)
          }
        } catch (error) {
          console.error(`⚠️ Failed to permanently delete course ${subj.code} from MySQL:`, error)
        }
      }

      const updatedRecycleBinSubjects = recycleBinSubjects.filter(s => 
        !subjectsToDelete.some(toDelete => toDelete.code === s.code)
      )
      setRecycleBinSubjects(updatedRecycleBinSubjects)
      
      setSelectedRecycleBinSubjects([])
      setSelectAllRecycleBinSubjects(false)

      const newAlert = {
        id: Date.now(),
        type: 'general',
        title: 'Subjects Permanently Deleted',
        message: `${subjectsToDelete.length} subject(s) have been permanently deleted from Recycle Bin.`,
        timestamp: new Date(),
        read: false,
      }
      const updatedAlerts = [newAlert, ...alerts]
      setAlerts(updatedAlerts)

      const payload = {
        subjects,
        removedSubjects,
        recycleBinSubjects: updatedRecycleBinSubjects,
        students,
        enrolls,
        alerts: updatedAlerts,
        records,
        grades,
        ownerUid: profUid,
        updatedAt: new Date().toISOString(),
      }

      try {
        await setWithBackup(DASHBOARD_COLLECTION, profUid, payload, { forceWrite: true })
      } catch (error) {
        console.error('Failed to save after permanent delete', error)
      }

      setShowDeleteSubjectModal(false)
      setSubjectPendingDelete(null)
      return
    }


    const subjectCode = subject.code


    try {
      const course = await getCourseByCode(subjectCode)
      if (course && course.id) {
        await deleteCourse(course.id)
      } else {
        console.warn(`⚠️ Course ${subjectCode} not found in MySQL; skipping delete`)
      }
    } catch (error) {
      console.error('⚠️ Failed to permanently delete course from MySQL:', error)
    }

    const updatedRecycleBinSubjects = recycleBinSubjects.filter(s => s.code !== subjectCode)
    setRecycleBinSubjects(updatedRecycleBinSubjects)

    const newAlert = {
      id: Date.now(),
      type: 'general',
      title: 'Subject Permanently Deleted',
      message: `${subject.name} has been permanently deleted.`,
      timestamp: new Date(),
      read: false,
    }
    const updatedAlerts = [newAlert, ...alerts]
    setAlerts(updatedAlerts)

    const payload = {
      subjects,
      removedSubjects,
      recycleBinSubjects: updatedRecycleBinSubjects,
      students,
      enrolls,
      alerts: updatedAlerts,
      records,
      grades,
      ownerUid: profUid,
      updatedAt: new Date().toISOString(),
    }

    try {
      await setWithBackup(DASHBOARD_COLLECTION, profUid, payload, { forceWrite: true })
    } catch (error) {
      console.error('Failed to save after permanent delete', error)
    }

    setShowDeleteSubjectModal(false)
    setSubjectPendingDelete(null)
    setDeleteSubjectMode('delete')
  }, [subjectPendingDelete, recycleBinSubjects, subjects, removedSubjects, students, enrolls, alerts, records, grades, profUid, setRecycleBinSubjects, setAlerts, setSelectedRecycleBinSubjects, setSelectAllRecycleBinSubjects, setShowDeleteSubjectModal, setSubjectPendingDelete, setDeleteSubjectMode])

  const handleRestoreFromRecycleBin = useCallback(async (subjectCode) => {
    const subject = recycleBinSubjects.find(s => s.code === subjectCode)
    if (!subject) return

    const updatedRecycleBinSubjects = recycleBinSubjects.filter(s => s.code !== subjectCode)
    const updatedRemovedSubjects = [...removedSubjects, subject]
    
    setRecycleBinSubjects(updatedRecycleBinSubjects)
    setRemovedSubjects(updatedRemovedSubjects)

    const newAlert = {
      id: Date.now(),
      type: 'general',
      title: 'Subject Restored',
      message: `${subject.name} has been restored to Archived Subjects.`,
      timestamp: new Date(),
      read: false,
    }
    const updatedAlerts = [newAlert, ...alerts]
    setAlerts(updatedAlerts)

    const payload = {
      subjects,
      removedSubjects: updatedRemovedSubjects,
      recycleBinSubjects: updatedRecycleBinSubjects,
      students,
      enrolls,
      alerts: updatedAlerts,
      records,
      grades,
      ownerUid: profUid,
      updatedAt: new Date().toISOString(),
    }

    try {
      await setWithBackup(DASHBOARD_COLLECTION, profUid, payload, { forceWrite: true })
    } catch (error) {
      console.error('Failed to save after restore', error)
    }
  }, [recycleBinSubjects, removedSubjects, subjects, students, enrolls, alerts, records, grades, profUid, setRecycleBinSubjects, setRemovedSubjects, setAlerts])

  return {
    handleDeleteSubject,
    handleRestoreSubject,
    handleDeleteArchivedSubject,
    handleDeleteAllArchivedSubjects,
    handlePermanentDeleteAllFromRecycleBin,
    handlePermanentDeleteSelectedFromRecycleBin,
    confirmArchiveSubject,
    confirmPermanentDelete,
    handleRestoreFromRecycleBin
  }
}

