/**
 * Student-related utility functions
 * Common patterns for student operations
 */
import { normalizeStudentId } from './validationHelpers'

/**
 * Find a student by ID with normalized comparison
 * @param {Array} students - Array of student objects
 * @param {string} studentId - Student ID to find
 * @returns {Object|null} Student object or null if not found
 */
export function findStudentById(students, studentId) {
  if (!students || !studentId) return null
  return students.find(s => normalizeStudentId(s.id) === normalizeStudentId(studentId))
}

/**
 * Check if a student is enrolled in a subject
 * @param {Array} enrolls - Enrollment array for the subject
 * @param {string} studentId - Student ID to check
 * @returns {boolean} True if student is enrolled
 */
export function isStudentEnrolled(enrolls, studentId) {
  if (!enrolls || !studentId) return false
  return enrolls.some(id => normalizeStudentId(id) === normalizeStudentId(studentId))
}

/**
 * Get enrolled students for a subject
 * @param {Array} students - Array of all students
 * @param {Array} enrolls - Enrollment array for the subject
 * @param {boolean} includeArchived - Whether to include archived students
 * @returns {Array} Array of enrolled student objects
 */
export function getEnrolledStudents(students, enrolls, includeArchived = false) {
  if (!students || !enrolls) return []

  return students.filter(student => {
    const enrolled = isStudentEnrolled(enrolls, student.id)

    if (!includeArchived) {
      const isArchived = (student.archivedSubjects || []).some(subjectCode =>
        enrolls.includes(subjectCode)
      )
      return enrolled && !isArchived
    }

    return enrolled
  })
}

/**
 * Filter students by search query
 * @param {Array} students - Array of student objects
 * @param {string} query - Search query
 * @param {Array} excludeEnrolledIn - Optional array of subject codes to exclude enrolled students
 * @returns {Array} Filtered students
 */
export function searchStudents(students, query, excludeEnrolledIn = null) {
  if (!students) return []
  if (!query || query.trim() === '') return students

  const normalizedQuery = query.toLowerCase().trim()

  return students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(normalizedQuery) ||
      student.id.toString().toLowerCase().includes(normalizedQuery) ||
      (student.email && student.email.toLowerCase().includes(normalizedQuery))

    if (excludeEnrolledIn && matchesSearch) {
      return !excludeEnrolledIn.some(subjectCode =>
        isStudentEnrolled(student.enrolls?.[subjectCode], student.id)
      )
    }

    return matchesSearch
  })
}

/**
 * Get student display name
 * @param {Object} student - Student object
 * @returns {string} Display name
 */
export function getStudentDisplayName(student) {
  if (!student) return 'Unknown Student'
  return student.name || `Student ${student.id}` || 'Unknown Student'
}

/**
 * Get student enrollment status for a subject
 * @param {Object} student - Student object
 * @param {string} subjectCode - Subject code
 * @returns {Object} { enrolled: boolean, archived: boolean }
 */
export function getStudentSubjectStatus(student, subjectCode) {
  if (!student || !subjectCode) {
    return { enrolled: false, archived: false }
  }

  const enrolled = student.enrolls?.[subjectCode]?.includes(student.id) || false
  const archived = (student.archivedSubjects || []).includes(subjectCode)

  return { enrolled, archived }
}
