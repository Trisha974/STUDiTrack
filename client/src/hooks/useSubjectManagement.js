/**
 * Custom hook for managing subject operations
 * Handles add, update, delete, restore, and archive subject logic
 */
import { useCallback } from 'react'
import { DASHBOARD_COLLECTION, ALERT_TYPES } from '../constants/appConstants'
import { setWithBackup } from '../services/firestoreWithBackup'
import { getCourseByCode, updateCourse } from '../services/courses'

export function useSubjectManagement({
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
}) {

  /**
   * Add a new subject
   */
  const handleAddSubject = useCallback(async (e, newSubject, setNewSubject, setAddSubjectError, setIsSavingSubject) => {
    e.preventDefault()


    setAddSubjectError('')


    const duplicateSubject = subjects.find(s =>
      s.code === newSubject.code && s.name === newSubject.name
    )

    if (duplicateSubject) {
      setAddSubjectError('A subject with this code and name already exists. Please use a different code or name.')
      return
    }

    setIsSavingSubject(true)

    try {

      const subjectData = {
        ...newSubject,
        createdAt: new Date().toISOString()
      }

      const addedSubject = await subjectsHook.addSubject(subjectData)


      setSubjects(subjectsHook.subjects)


      const updatedEnrolls = { ...enrolls, [newSubject.code]: [] }
      setNormalizedEnrolls(updatedEnrolls)
      enrollmentsHook.setEnrolls(updatedEnrolls)


      const newAlert = {
        id: Date.now(),
        type: 'general',
        title: 'Subject Added',
        message: `${newSubject.name} (${newSubject.code}) has been added successfully`,
        timestamp: new Date(),
        read: false,
      }
      const updatedAlerts = [newAlert, ...alerts]


      await saveData(subjectsHook.subjects, students, updatedEnrolls, updatedAlerts, records, grades, profUid)


      setNewSubject({ code: '', name: '', credits: '', term: 'first' })
      setAddSubjectError('')
      setIsSavingSubject(false)


      setActiveTab('subjects')
      setShowSubjectDetail(false)
      setSelectedSubject(null)


      setShowAddSubjectModal(false)
    } catch (error) {
      console.error('Failed to save subject:', error)
      setAddSubjectError(error.message || 'Failed to save subject. Please try again.')
      setIsSavingSubject(false)
    }
  }, [subjects, enrolls, alerts, records, grades, profUid, subjectsHook, enrollmentsHook, saveData, addCustomAlert, setActiveTab, setShowSubjectDetail, setSelectedSubject, setShowAddSubjectModal])

  /**
   * Update subject term
   */
  const handleUpdateSubjectTerm = useCallback(async (subjectCode, newTerm, e) => {
    if (e) {
      e.stopPropagation()
    }

    try {
      const subject = subjects.find(s => s.code === subjectCode)
      if (!subject) {
        addCustomAlert(ALERT_TYPES.ERROR, 'Subject Not Found', 'Subject not found. Please refresh and try again.', false)
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
          console.log(`? Updated course term in MySQL: ${subjectCode} ? ${newTerm}`)
        } else {
          console.warn(`?? Course not found in MySQL for ${subjectCode}, term not updated in database`)
        }
      } catch (mysqlError) {
        console.warn(`? Failed to update course term in MySQL:`, mysqlError.message)

      }


      await saveData(updatedSubjects, students, enrolls, alerts, records, grades, profUid)

      addCustomAlert(ALERT_TYPES.SUCCESS, 'Term Updated', `${subject.name} has been moved to ${newTerm === 'first' ? '1st' : '2nd'} term.`, false)
    } catch (error) {
      console.error('Failed to update subject term:', error)
      addCustomAlert(ALERT_TYPES.ERROR, 'Update Failed', 'Failed to update subject term. Please try again.', false)
    }
  }, [subjects, students, enrolls, alerts, records, grades, profUid, saveData, addCustomAlert])

  /**
   * Delete/archive subject
   */
  const handleDeleteSubject = useCallback(async (subjectCode, e) => {
    e.stopPropagation()
    const subject = subjects.find(s => s.code === subjectCode)
    if (!subject) return

    setSubjectPendingDelete(subject)
    setDeleteSubjectMode('archive')
    setShowDeleteSubjectModal(true)
  }, [subjects, setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  /**
   * Restore subject from removed subjects
   */
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
        console.log('? Rebuilt enrollments from MySQL after restoring subject:', rebuiltEnrolls)
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
        console.warn('?? Professor MySQL ID not available; cannot rebuild enrollments from MySQL')

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
      console.error('? Failed to rebuild enrollments from MySQL:', error)

      const payload = {
        subjects: updatedSubjects,
        removedSubjects: updatedRemovedSubjects,
        students: students,
        enrolls: enrolls,
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
  }, [removedSubjects, subjects, profProfile, buildEnrollsFromMySQL, setNormalizedEnrolls, students, enrolls, alerts, records, grades, profUid, setSubjects, setRemovedSubjects])

  /**
   * Delete archived subject permanently
   */
  const handleDeleteArchivedSubject = useCallback(async (subjectCode) => {
    const subject = removedSubjects.find(s => s.code === subjectCode)
    if (!subject) return

    setSubjectPendingDelete(subject)
    setDeleteSubjectMode('delete')
    setShowDeleteSubjectModal(true)
  }, [removedSubjects, setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  /**
   * Delete all archived subjects permanently
   */
  const handleDeleteAllArchivedSubjects = useCallback(() => {
    setSubjectPendingDelete(null)
    setDeleteSubjectMode('deleteAll')
    setShowDeleteSubjectModal(true)
  }, [setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  /**
   * Permanent delete selected from recycle bin
   */
  const handlePermanentDeleteSelectedFromRecycleBin = useCallback(() => {
    setSubjectPendingDelete(null)
    setDeleteSubjectMode('permanentDeleteSelected')
    setShowDeleteSubjectModal(true)
  }, [setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  /**
   * Permanent delete from recycle bin
   */
  const handlePermanentDeleteFromRecycleBin = useCallback(async (subjectCode) => {
    const subject = removedSubjects.find(s => s.code === subjectCode)
    if (!subject) return

    setSubjectPendingDelete(subject)
    setDeleteSubjectMode('permanentDelete')
    setShowDeleteSubjectModal(true)
  }, [removedSubjects, setSubjectPendingDelete, setDeleteSubjectMode, setShowDeleteSubjectModal])

  /**
   * Restore from recycle bin to archived
   */
  const handleRestoreFromRecycleBin = useCallback(async (subjectCode) => {
    const subject = removedSubjects.find(s => s.code === subjectCode)
    if (!subject) return


    const updatedRemovedSubjects = removedSubjects.filter(s => s.code !== subjectCode)
    const updatedSubjects = [...subjects, subject]

    setSubjects(updatedSubjects)
    setRemovedSubjects(updatedRemovedSubjects)


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
      addCustomAlert(ALERT_TYPES.SUCCESS, 'Subject Restored', `${subject.name} has been restored from recycle bin.`, false)
    } catch (error) {
      console.error('Failed to restore subject from recycle bin:', error)
      addCustomAlert(ALERT_TYPES.ERROR, 'Restore Failed', 'Failed to restore subject. Please try again.', false)
    }
  }, [removedSubjects, subjects, students, enrolls, alerts, records, grades, profUid, setSubjects, setRemovedSubjects, addCustomAlert])

  return {
    handleAddSubject,
    handleUpdateSubjectTerm,
    handleDeleteSubject,
    handleRestoreSubject,
    handleDeleteArchivedSubject,
    handleDeleteAllArchivedSubjects,
    handlePermanentDeleteSelectedFromRecycleBin,
    handlePermanentDeleteFromRecycleBin,
    handleRestoreFromRecycleBin
  }
}
