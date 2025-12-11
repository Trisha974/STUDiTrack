// Service helpers for managing attendance
// Now uses Express.js + MySQL backend via API
import * as attendanceApi from './api/attendanceApi'

/**
 * Creates a new attendance record
 * @param {Object} attendanceData - { studentId: number, courseId: number, date: string (YYYY-MM-DD), status: 'present'|'absent'|'late'|'excused' }
 * @returns {Promise<string>} Attendance MySQL ID as string
 */
async function createAttendance(attendanceData) {
  const attendance = await attendanceApi.createAttendance(attendanceData)
  return attendance.id.toString()
}

/**
 * Updates an existing attendance record
 * @param {string|number} attendanceId - Attendance MySQL ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated attendance document
 */
async function updateAttendance(attendanceId, updates) {
  if (!attendanceId) return null
  return await attendanceApi.updateAttendance(attendanceId, updates)
}

/**
 * Gets or creates attendance record for a specific student, course, and date
 * @param {number} studentId - Student's MySQL ID (integer)
 * @param {number} courseId - Course MySQL ID (integer)
 * @param {string} date - Date string in format YYYY-MM-DD
 * @param {string} status - Attendance status: 'present', 'absent', 'late', or 'excused'
 * @returns {Promise<string>} Attendance MySQL ID as string
 */
async function setAttendanceForDate(studentId, courseId, date, status) {
  if (!studentId || !courseId || !date || !status) {
    throw new Error('studentId, courseId, date, and status are required')
  }
  const attendance = await attendanceApi.setAttendanceForDate(studentId, courseId, date, status)
  return attendance.id.toString()
}

/**
 * Gets attendance record for a specific student, course, and date
 * @param {string|number} studentId - Student's MySQL ID
 * @param {string|number} courseId - Course MySQL ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Promise<Object|null>} Attendance document or null
 */
async function getAttendanceByStudentCourseAndDate(studentId, courseId, date) {
  if (!studentId || !courseId || !date) return null
  return await attendanceApi.getAttendanceByStudentCourseAndDate(studentId, courseId, date)
}

/**
 * Gets all attendance records for a student
 * @param {string|number} studentId - Student's MySQL ID
 * @returns {Promise<Array>} Array of attendance documents
 */
async function getAttendanceByStudent(studentId) {
  if (!studentId) return []
  return await attendanceApi.getAttendanceByStudent(studentId)
}

/**
 * Gets all attendance records for a course
 * @param {string|number} courseId - Course MySQL ID
 * @returns {Promise<Array>} Array of attendance documents
 */
async function getAttendanceByCourse(courseId) {
  if (!courseId) return []
  return await attendanceApi.getAttendanceByCourse(courseId)
}

/**
 * Gets attendance records for a specific student in a specific course
 * @param {string|number} studentId - Student's MySQL ID
 * @param {string|number} courseId - Course MySQL ID
 * @returns {Promise<Array>} Array of attendance documents
 */
async function getAttendanceByStudentAndCourse(studentId, courseId) {
  if (!studentId || !courseId) return []
  return await attendanceApi.getAttendanceByStudentAndCourse(studentId, courseId)
}

/**
 * Sets up a real-time listener for student attendance (using polling)
 * @param {string|number} studentId - Student's MySQL ID
 * @param {Function} callback - Callback function that receives array of attendance records
 * @returns {Function} Unsubscribe function
 */
function subscribeToStudentAttendance(studentId, callback) {
  return attendanceApi.subscribeToStudentAttendance(studentId, callback)
}

/**
 * Deletes an attendance record
 * @param {string|number} attendanceId - Attendance MySQL ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteAttendance(attendanceId) {
  if (!attendanceId) return false
  await attendanceApi.deleteAttendance(attendanceId)
  return true
}

export {
  createAttendance,
  updateAttendance,
  setAttendanceForDate,
  getAttendanceByStudentCourseAndDate,
  getAttendanceByStudent,
  getAttendanceByCourse,
  getAttendanceByStudentAndCourse,
  subscribeToStudentAttendance,
  deleteAttendance,
}



