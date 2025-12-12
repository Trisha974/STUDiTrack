/**
 * Custom hook for centralized validation logic
 * Provides consistent validation across the application
 */
import { useCallback } from 'react'

export function useValidation() {

  /**
   * Validate student ID format
   * @param {string} studentId - Student ID to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  const validateStudentId = useCallback((studentId) => {
    if (!studentId || studentId.trim() === '') {
      return { isValid: false, error: 'Student ID is required' }
    }

    const trimmed = studentId.trim()


    if (!/^\d{6,9}$/.test(trimmed)) {
      return { isValid: false, error: 'Student ID must be 6-9 digits' }
    }


    if (trimmed === '0'.repeat(trimmed.length)) {
      return { isValid: false, error: 'Student ID cannot be all zeros' }
    }

    return { isValid: true, error: '' }
  }, [])

  /**
   * Validate student name
   * @param {string} name - Student name to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  const validateStudentName = useCallback((name) => {
    if (!name || name.trim() === '') {
      return { isValid: false, error: 'Student name is required' }
    }

    const trimmed = name.trim()


    if (trimmed.length < 2) {
      return { isValid: false, error: 'Student name must be at least 2 characters' }
    }


    if (trimmed.length > 100) {
      return { isValid: false, error: 'Student name cannot exceed 100 characters' }
    }


    if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
      return { isValid: false, error: 'Student name can only contain letters, spaces, hyphens, and apostrophes' }
    }


    if (!/[a-zA-Z]/.test(trimmed)) {
      return { isValid: false, error: 'Student name must contain at least one letter' }
    }

    return { isValid: true, error: '' }
  }, [])

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {Object} { isValid: boolean, error: string }
   */
  const validateEmail = useCallback((email) => {
    if (!email || email.trim() === '') {

      return { isValid: true, error: '' }
    }

    const trimmed = email.trim()


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(trimmed)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }


    if (trimmed.length > 254) {
      return { isValid: false, error: 'Email address is too long' }
    }

    return { isValid: true, error: '' }
  }, [])

  /**
   * Validate subject form
   * @param {Object} subject - Subject object to validate
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  const validateSubjectForm = useCallback((subject) => {
    const errors = {}


    if (!subject.code || subject.code.trim() === '') {
      errors.code = 'Subject code is required'
    } else {
      const code = subject.code.trim()
      if (code.length < 3 || code.length > 20) {
        errors.code = 'Subject code must be 3-20 characters'
      }
      if (!/^[A-Z0-9\-_]+$/.test(code)) {
        errors.code = 'Subject code can only contain uppercase letters, numbers, hyphens, and underscores'
      }
    }


    if (!subject.name || subject.name.trim() === '') {
      errors.name = 'Subject name is required'
    } else {
      const name = subject.name.trim()
      if (name.length < 3 || name.length > 100) {
        errors.name = 'Subject name must be 3-100 characters'
      }
    }


    if (subject.credits !== undefined && subject.credits !== null && subject.credits !== '') {
      const credits = parseInt(subject.credits)
      if (isNaN(credits) || credits < 1 || credits > 10) {
        errors.credits = 'Credits must be a number between 1 and 10'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [])

  /**
   * Validate grade value
   * @param {number|string} grade - Grade to validate
   * @param {number} maxPoints - Maximum points for the assessment
   * @returns {Object} { isValid: boolean, error: string }
   */
  const validateGrade = useCallback((grade, maxPoints) => {
    if (grade === '' || grade === null || grade === undefined) {
      return { isValid: false, error: 'Grade is required' }
    }

    const numericGrade = parseFloat(grade)

    if (isNaN(numericGrade)) {
      return { isValid: false, error: 'Grade must be a valid number' }
    }

    if (numericGrade < 0) {
      return { isValid: false, error: 'Grade cannot be negative' }
    }

    if (numericGrade > maxPoints) {
      return { isValid: false, error: `Grade cannot exceed maximum points (${maxPoints})` }
    }

    return { isValid: true, error: '' }
  }, [])

  /**
   * Validate assessment form
   * @param {Object} assessment - Assessment data to validate
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  const validateAssessmentForm = useCallback((assessment) => {
    const errors = {}


    if (!assessment.title || assessment.title.trim() === '') {
      errors.title = 'Assessment title is required'
    } else {
      const title = assessment.title.trim()
      if (title.length < 1 || title.length > 100) {
        errors.title = 'Assessment title must be 1-100 characters'
      }
    }


    if (assessment.maxPoints === undefined || assessment.maxPoints === null || assessment.maxPoints === '') {
      errors.maxPoints = 'Maximum points is required'
    } else {
      const maxPoints = parseFloat(assessment.maxPoints)
      if (isNaN(maxPoints) || maxPoints <= 0 || maxPoints > 1000) {
        errors.maxPoints = 'Maximum points must be a number between 0.1 and 1000'
      }
    }


    const validTypes = ['quiz', 'assignment', 'midterm', 'final', 'project', 'lab', 'presentation', 'participation']
    if (!assessment.type || !validTypes.includes(assessment.type)) {
      errors.type = 'Please select a valid assessment type'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [])

  /**
   * Validate CSV data structure
   * @param {Array} data - CSV data array
   * @returns {Object} { isValid: boolean, errors: Array, warnings: Array }
   */
  const validateCSVData = useCallback((data) => {
    const errors = []
    const warnings = []

    if (!Array.isArray(data) || data.length === 0) {
      errors.push('No data found in CSV file')
      return { isValid: false, errors, warnings }
    }


    const firstRow = data[0]
    const hasId = Object.keys(firstRow).some(key =>
      key.toLowerCase().includes('id') || key.toLowerCase().includes('student')
    )
    const hasName = Object.keys(firstRow).some(key =>
      key.toLowerCase().includes('name')
    )

    if (!hasId) {
      errors.push('CSV must contain a column with "ID" or "Student ID"')
    }

    if (!hasName) {
      errors.push('CSV must contain a column with "Name"')
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings }
    }


    const idCounts = new Map()

    data.forEach((row, index) => {

      const id = row.id || row.studentId || row['Student ID'] || ''
      const name = row.name || row['Student Name'] || ''

      if (!id.trim()) {
        errors.push(`Row ${index + 1}: Student ID is missing`)
      }

      if (!name.trim()) {
        errors.push(`Row ${index + 1}: Student name is missing`)
      }


      if (id.trim()) {
        const count = idCounts.get(id.trim()) || 0
        idCounts.set(id.trim(), count + 1)
      }
    })


    idCounts.forEach((count, id) => {
      if (count > 1) {
        warnings.push(`Student ID "${id}" appears ${count} times (duplicates will be skipped)`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [])

  return {
    validateStudentId,
    validateStudentName,
    validateEmail,
    validateSubjectForm,
    validateGrade,
    validateAssessmentForm,
    validateCSVData
  }
}

