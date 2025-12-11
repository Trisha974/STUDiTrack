// Service helpers for managing enrollments
// Now uses Express.js + MySQL backend via API
import * as enrollmentsApi from './api/enrollmentsApi'

/**
 * Creates a new enrollment (student enrolled in course)
 * @param {string|number} studentId - Student's MySQL ID (integer)
 * @param {string|number} courseId - Course MySQL ID (integer)
 * @param {Object} metadata - Optional metadata (not stored in MySQL, kept for compatibility)
 * @returns {Promise<string>} Enrollment MySQL ID as string
 */
async function createEnrollment(studentId, courseId, metadata = {}) {
  if (!studentId || !courseId) throw new Error('studentId and courseId are required')
  
  // Check if enrollment already exists
  const existing = await getEnrollmentByStudentAndCourse(studentId, courseId)
  if (existing) return existing.id.toString()
  
  const enrollment = await enrollmentsApi.createEnrollment(studentId, courseId, metadata)
  return enrollment.id.toString()
}

/**
 * Gets enrollment by student and course
 * @param {string|number} studentId - Student's MySQL ID
 * @param {string|number} courseId - Course MySQL ID
 * @returns {Promise<Object|null>} Enrollment document or null
 */
async function getEnrollmentByStudentAndCourse(studentId, courseId) {
  if (!studentId || !courseId) return null
  return await enrollmentsApi.getEnrollmentByStudentAndCourse(studentId, courseId)
}

/**
 * Gets all enrollments for a student
 * @param {string|number} studentId - Student's MySQL ID
 * @returns {Promise<Array>} Array of enrollment documents
 */
async function getEnrollmentsByStudent(studentId) {
  if (!studentId) return []
  return await enrollmentsApi.getEnrollmentsByStudent(studentId)
}

/**
 * Gets all enrollments for a course
 * @param {string|number} courseId - Course MySQL ID
 * @returns {Promise<Array>} Array of enrollment documents
 */
async function getEnrollmentsByCourse(courseId) {
  if (!courseId) return []
  return await enrollmentsApi.getEnrollmentsByCourse(courseId)
}

/**
 * Deletes an enrollment (unenrolls student from course)
 * @param {string|number} enrollmentId - Enrollment MySQL ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteEnrollment(enrollmentId) {
  if (!enrollmentId) return false
  await enrollmentsApi.deleteEnrollment(enrollmentId)
  return true
}

/**
 * Deletes enrollment by student and course
 * @param {string|number} studentId - Student's MySQL ID
 * @param {string|number} courseId - Course MySQL ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteEnrollmentByStudentAndCourse(studentId, courseId) {
  await enrollmentsApi.deleteEnrollmentByStudentAndCourse(studentId, courseId)
  return true
}

/**
 * Subscribes to real-time enrollments for a specific course (using polling)
 * @param {string|number} courseId
 * @param {Function} callback
 * @returns {Function} unsubscribe handler
 */
function subscribeToCourseEnrollments(courseId, callback) {
  return enrollmentsApi.subscribeToCourseEnrollments(courseId, callback)
}

/**
 * Subscribes to real-time enrollments for a specific student (using polling)
 * @param {string|number} studentId
 * @param {Function} callback
 * @returns {Function} unsubscribe handler
 */
function subscribeToStudentEnrollments(studentId, callback) {
  return enrollmentsApi.subscribeToStudentEnrollments(studentId, callback)
}

export {
  createEnrollment,
  getEnrollmentByStudentAndCourse,
  getEnrollmentsByStudent,
  getEnrollmentsByCourse,
  deleteEnrollment,
  deleteEnrollmentByStudentAndCourse,
  subscribeToCourseEnrollments,
  subscribeToStudentEnrollments,
}



