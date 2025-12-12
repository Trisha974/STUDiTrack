/**
 * Custom hook for comprehensive student management operations
 * Extends basic CRUD with advanced enrollment, bulk operations, and validation
 */
import { useState, useCallback } from 'react'
import { useValidation } from './useValidation'
import { useErrorHandler } from './useErrorHandler'
import { ALERT_TYPES } from '../constants/appConstants'
import { normalizeStudentId } from '../utils/validationHelpers'
import { findStudentById, isStudentEnrolled, getEnrolledStudents } from '../utils/studentHelpers'
import { addStudent, getStudentByNumericalId } from '../services/students'
import { createEnrollment, deleteEnrollmentByStudentAndCourse } from '../services/enrollments'
import { getCourseByCode } from '../services/courses'

export function useStudentManagement({
  students,
  enrolls,
  subjects,
  onSave,
  addCustomAlert
}) {
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })

  const { validateStudentId, validateStudentName, validateEmail } = useValidation()
  const { handleApiError, handleValidationError } = useErrorHandler(addCustomAlert)

  /**
   * Create a new student and enroll them in a subject
   */
  const handleCreateStudent = useCallback(async (studentData, subjectCode) => {
    try {
      setIsCreatingStudent(true)


      const idValidation = validateStudentId(studentData.id)
      const nameValidation = validateStudentName(studentData.name)
      const emailValidation = validateEmail(studentData.email)

      if (!idValidation.isValid || !nameValidation.isValid) {
        const error = !idValidation.isValid ? idValidation.error : nameValidation.error
        throw new Error(error)
      }


      const existingStudent = findStudentById(students, studentData.id)
    if (existingStudent) {
        throw new Error('A student with this ID already exists')
      }


      if (isStudentEnrolled(enrolls[subjectCode], studentData.id)) {
        throw new Error('This student is already enrolled in the selected subject')
      }


      const mysqlStudent = await addStudent({
        id: studentData.id,
        name: studentData.name,
        email: studentData.email || null
      })


      const newStudent = {
        id: studentData.id,
        name: studentData.name,
        email: studentData.email || '',
        archivedSubjects: []
      }

      const updatedStudents = [...students, newStudent]


      const updatedEnrolls = {
        ...enrolls,
        [subjectCode]: [...(enrolls[subjectCode] || []), studentData.id]
      }


      if (mysqlStudent && mysqlStudent.id) {
        const course = await getCourseByCode(subjectCode)
        if (course && course.id) {
          await createEnrollment({
            studentId: mysqlStudent.id,
            courseId: course.id
          })
        }
      }


      await onSave({
        students: updatedStudents,
        enrolls: updatedEnrolls
      })

      addCustomAlert(ALERT_TYPES.SUCCESS, 'Student Created',
        `${studentData.name} has been created and enrolled in ${subjects.find(s => s.code === subjectCode)?.name || subjectCode}`,
        false
      )

      return { success: true, student: newStudent }

    } catch (error) {
      const errorMessage = handleApiError(error, 'Student Creation')
      return { success: false, error: errorMessage }
    } finally {
      setIsCreatingStudent(false)
    }
  }, [students, enrolls, subjects, validateStudentId, validateStudentName, validateEmail, onSave, addCustomAlert, handleApiError])

  /**
   * Validate student data for bulk import
   */
  const validateStudentForBulkImport = useCallback((studentData, rowIndex) => {
    const idValidation = validateStudentId(studentData.id)
    const nameValidation = validateStudentName(studentData.name)

    if (!idValidation.isValid || !nameValidation.isValid) {
      return {
        isValid: false,
        error: `${!idValidation.isValid ? idValidation.error : nameValidation.error}`
      }
    }

    return { isValid: true, normalizedId: normalizeStudentId(studentData.id) }
  }, [validateStudentId, validateStudentName])

  /**
   * Check for duplicates and enrollment conflicts
   */
  const checkBulkImportConflicts = useCallback((normalizedId, updatedStudents, updatedEnrolls, subjectCode) => {

    const existingInBatch = findStudentById(updatedStudents, normalizedId)
    if (existingInBatch) {
      return { hasConflict: true, type: 'duplicate' }
    }


    if (isStudentEnrolled(updatedEnrolls[subjectCode], normalizedId)) {
      return { hasConflict: true, type: 'alreadyEnrolled' }
    }

    return { hasConflict: false }
  }, [])

  /**
   * Create student and enrollment in database
   */
  const createStudentWithEnrollment = useCallback(async (studentData, subjectCode) => {

    const mysqlStudent = await addStudent({
      id: studentData.id,
      name: studentData.name,
      email: studentData.email || null
    })


    if (mysqlStudent && mysqlStudent.id) {
      const course = await getCourseByCode(subjectCode)
      if (course && course.id) {
        await createEnrollment({
          studentId: mysqlStudent.id,
          courseId: course.id
        })
      }
    }

    return mysqlStudent
  }, [])

  /**
   * Process single student in bulk import
   */
  const processBulkImportStudent = useCallback(async (
    studentData,
    rowIndex,
    updatedStudents,
    updatedEnrolls,
    subjectCode
  ) => {

    const validation = validateStudentForBulkImport(studentData, rowIndex)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }


    const conflicts = checkBulkImportConflicts(validation.normalizedId, updatedStudents, updatedEnrolls, subjectCode)
    if (conflicts.hasConflict) {
      return { success: false, type: conflicts.type }
    }

    try {

      await createStudentWithEnrollment(studentData, subjectCode)


      const newStudent = {
        id: studentData.id,
        name: studentData.name,
        email: studentData.email || '',
        archivedSubjects: []
      }

      updatedStudents.push(newStudent)


      if (!updatedEnrolls[subjectCode]) updatedEnrolls[subjectCode] = []
      updatedEnrolls[subjectCode].push(studentData.id)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [validateStudentForBulkImport, checkBulkImportConflicts, createStudentWithEnrollment])

  /**
   * Generate bulk import summary message
   */
  const generateBulkImportSummary = useCallback((results) => {
    let summary = `${results.success} students created`
    if (results.duplicates > 0) summary += `, ${results.duplicates} duplicates skipped`
    if (results.alreadyEnrolled > 0) summary += `, ${results.alreadyEnrolled} already enrolled`
    if (results.failed > 0) summary += `, ${results.failed} failed`
    return summary
  }, [])

  /**
   * Bulk create students from CSV data
   */
  const handleBulkCreateStudents = useCallback(async (csvData, subjectCode, onProgress) => {
    try {
      setIsBulkProcessing(true)
      setBulkProgress({ current: 0, total: csvData.length })

      const results = {
        success: 0,
        failed: 0,
        duplicates: 0,
        alreadyEnrolled: 0,
        errors: []
      }

      const updatedStudents = [...students]
      const updatedEnrolls = { ...enrolls }

      for (let i = 0; i < csvData.length; i++) {
        const studentData = csvData[i]
        setBulkProgress({ current: i + 1, total: csvData.length })

        const result = await processBulkImportStudent(
          studentData,
          i,
          updatedStudents,
          updatedEnrolls,
          subjectCode
        )

        if (result.success) {
          results.success++
        } else if (result.type === 'duplicate') {
          results.duplicates++
        } else if (result.type === 'alreadyEnrolled') {
          results.alreadyEnrolled++
        } else {
          results.failed++
          results.errors.push(`Row ${i + 1}: ${result.error}`)
        }

        if (onProgress) onProgress(results)
      }


      await onSave({
        students: updatedStudents,
        enrolls: updatedEnrolls
      })

      const summary = generateBulkImportSummary(results)
      addCustomAlert(ALERT_TYPES.SUCCESS, 'Bulk Import Complete', summary, false)

      if (results.errors.length > 0) {
        console.warn('Bulk import errors:', results.errors)
      }

      return results

    } catch (error) {
      const errorMessage = handleApiError(error, 'Bulk Student Creation')
      return { success: 0, failed: csvData.length, errors: [errorMessage] }
    } finally {
      setIsBulkProcessing(false)
      setBulkProgress({ current: 0, total: 0 })
    }
  }, [students, enrolls, processBulkImportStudent, generateBulkImportSummary, onSave, addCustomAlert, handleApiError])

  /**
   * Add student to subject (enroll existing student)
   */
  const handleAddStudentToSubject = useCallback(async (studentId, subjectCode) => {
    try {
      const student = findStudentById(students, studentId)
      if (!student) {
        throw new Error('Student not found')
      }


      const subjectEnrollments = enrolls[subjectCode] || []
      if (subjectEnrollments.some(id => normalizeStudentId(id) === normalizeStudentId(studentId))) {
        throw new Error('Student is already enrolled in this subject')
      }


      const updatedEnrolls = {
        ...enrolls,
        [subjectCode]: [...subjectEnrollments, studentId]
      }


      const mysqlStudent = await getStudentByNumericalId(studentId)
      const course = await getCourseByCode(subjectCode)

      if (mysqlStudent && mysqlStudent.id && course && course.id) {
        await createEnrollment({
          studentId: mysqlStudent.id,
          courseId: course.id
        })
      }


      await onSave({ enrolls: updatedEnrolls })

      const subjectName = subjects.find(s => s.code === subjectCode)?.name || subjectCode
      addCustomAlert(ALERT_TYPES.SUCCESS, 'Student Enrolled',
        `${student.name} has been enrolled in ${subjectName}`,
        false
      )

      return { success: true }

    } catch (error) {
      const errorMessage = handleApiError(error, 'Student Enrollment')
      return { success: false, error: errorMessage }
    }
  }, [students, enrolls, subjects, onSave, addCustomAlert, handleApiError])

  /**
   * Remove student from subject
   */
  const handleRemoveStudentFromSubject = useCallback(async (studentId, subjectCode) => {
    try {
      const subjectEnrollments = enrolls[subjectCode] || []
      const updatedEnrollments = subjectEnrollments.filter(id => normalizeStudentId(id) !== normalizeStudentId(studentId))

      const updatedEnrolls = {
        ...enrolls,
        [subjectCode]: updatedEnrollments
      }


      const mysqlStudent = await getStudentByNumericalId(studentId)
      const course = await getCourseByCode(subjectCode)

      if (mysqlStudent && mysqlStudent.id && course && course.id) {
        await deleteEnrollmentByStudentAndCourse(mysqlStudent.id, course.id)
      }


      await onSave({ enrolls: updatedEnrolls })

      const student = findStudentById(students, studentId)
      const subjectName = subjects.find(s => s.code === subjectCode)?.name || subjectCode

      addCustomAlert(ALERT_TYPES.SUCCESS, 'Student Removed',
        `${student?.name || studentId} has been removed from ${subjectName}`,
        false
      )

      return { success: true }

    } catch (error) {
      const errorMessage = handleApiError(error, 'Student Removal')
      return { success: false, error: errorMessage }
    }
  }, [students, enrolls, subjects, onSave, addCustomAlert, handleApiError])

  /**
   * Archive student for a subject
   */
  const handleArchiveStudent = useCallback(async (studentId, subjectCode) => {
    try {
      const updatedStudents = students.map(s => {
        if (normalizeStudentId(s.id) === normalizeStudentId(studentId)) {
          const archivedSubjects = s.archivedSubjects || []
          if (!archivedSubjects.includes(subjectCode)) {
            return { ...s, archivedSubjects: [...archivedSubjects, subjectCode] }
          }
        }
        return s
      })


      const subjectEnrollments = enrolls[subjectCode] || []
      const updatedEnrollments = subjectEnrollments.filter(id => normalizeStudentId(id) !== normalizeStudentId(studentId))

      const updatedEnrolls = {
        ...enrolls,
        [subjectCode]: updatedEnrollments
      }


      await onSave({
        students: updatedStudents,
        enrolls: updatedEnrolls
      })

      const student = findStudentById(students, studentId)
      const subjectName = subjects.find(s => s.code === subjectCode)?.name || subjectCode

      addCustomAlert(ALERT_TYPES.SUCCESS, 'Student Archived',
        `${student?.name || studentId} has been archived from ${subjectName}`,
        false
      )

      return { success: true }

    } catch (error) {
      const errorMessage = handleApiError(error, 'Student Archive')
      return { success: false, error: errorMessage }
    }
  }, [students, enrolls, subjects, onSave, addCustomAlert, handleApiError])

  /**
   * Restore archived student
   */
  const handleRestoreStudent = useCallback(async (studentId, subjectCode) => {
    try {
      const updatedStudents = students.map(s => {
        if (normalizeStudentId(s.id) === normalizeStudentId(studentId)) {
          return {
            ...s,
            archivedSubjects: (s.archivedSubjects || []).filter(code => code !== subjectCode)
          }
        }
        return s
      })


      const subjectEnrollments = enrolls[subjectCode] || []
      if (!subjectEnrollments.some(id => normalizeStudentId(id) === normalizeStudentId(studentId))) {
        const updatedEnrollments = [...subjectEnrollments, studentId]

        const updatedEnrolls = {
          ...enrolls,
          [subjectCode]: updatedEnrollments
        }


        await onSave({
          students: updatedStudents,
          enrolls: updatedEnrolls
        })
      } else {

        await onSave({ students: updatedStudents })
      }

      const student = findStudentById(students, studentId)
      const subjectName = subjects.find(s => s.code === subjectCode)?.name || subjectCode

      addCustomAlert(ALERT_TYPES.SUCCESS, 'Student Restored',
        `${student?.name || studentId} has been restored to ${subjectName}`,
        false
      )

      return { success: true }

    } catch (error) {
      const errorMessage = handleApiError(error, 'Student Restore')
      return { success: false, error: errorMessage }
    }
  }, [students, enrolls, subjects, onSave, addCustomAlert, handleApiError])

  /**
   * Get students enrolled in a specific subject
   */
  const getStudentsBySubject = useCallback((subjectCode, includeArchived = false) => {
    return getEnrolledStudents(students, enrolls[subjectCode], includeArchived)
  }, [students, enrolls])

  /**
   * Get archived students for a subject
   */
  const getArchivedStudentsBySubject = useCallback((subjectCode) => {
    return students.filter(student =>
      (student.archivedSubjects || []).includes(subjectCode)
    )
  }, [students])

  /**
   * Search students by name or ID
   */
  const searchStudents = useCallback((query, excludeEnrolledIn = null) => {
    if (!query.trim()) return students

    const normalizedQuery = query.toLowerCase().trim()

    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.id.toString().toLowerCase().includes(normalizedQuery) ||
        (student.email && student.email.toLowerCase().includes(normalizedQuery))

      if (excludeEnrolledIn && matchesSearch) {
        const enrolledIds = enrolls[excludeEnrolledIn] || []
        return !enrolledIds.some(id => normalizeStudentId(id) === normalizeStudentId(student.id))
      }

      return matchesSearch
    })
  }, [students, enrolls])

  return {

    isCreatingStudent,
    isBulkProcessing,
    bulkProgress,


    handleCreateStudent,
    handleBulkCreateStudents,
    handleAddStudentToSubject,
    handleRemoveStudentFromSubject,
    handleArchiveStudent,
    handleRestoreStudent,


    getStudentsBySubject,
    getArchivedStudentsBySubject,
    searchStudents
  }
}