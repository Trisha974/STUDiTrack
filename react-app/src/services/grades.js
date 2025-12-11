// Service helpers for managing grades
// Now uses Express.js + MySQL backend via API
import * as gradesApi from './api/gradesApi'

/**
 * Creates a new grade record
 * @param {Object} gradeData - { studentId: number, courseId: number, assessmentType: string, assessmentTitle: string, score: number, maxPoints: number, date?: string }
 * @returns {Promise<string>} Grade MySQL ID as string
 */
async function createGrade(gradeData) {
  const grade = await gradesApi.createGrade(gradeData)
  return grade.id.toString()
}

/**
 * Updates an existing grade record
 * @param {string|number} gradeId - Grade MySQL ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated grade document
 */
async function updateGrade(gradeId, updates) {
  if (!gradeId) return null
  return await gradesApi.updateGrade(gradeId, updates)
}

/**
 * Gets all grades for a student
 * @param {string|number} studentId - Student's MySQL ID
 * @returns {Promise<Array>} Array of grade documents
 */
async function getGradesByStudent(studentId) {
  if (!studentId) return []
  return await gradesApi.getGradesByStudent(studentId)
}

/**
 * Gets all grades for a course
 * @param {string|number} courseId - Course MySQL ID
 * @returns {Promise<Array>} Array of grade documents
 */
async function getGradesByCourse(courseId) {
  if (!courseId) return []
  return await gradesApi.getGradesByCourse(courseId)
}

/**
 * Gets grades for a specific student in a specific course
 * @param {string|number} studentId - Student's MySQL ID
 * @param {string|number} courseId - Course MySQL ID
 * @returns {Promise<Array>} Array of grade documents
 */
async function getGradesByStudentAndCourse(studentId, courseId) {
  if (!studentId || !courseId) return []
  return await gradesApi.getGradesByStudentAndCourse(studentId, courseId)
}

/**
 * Sets up a real-time listener for student grades (using polling)
 * @param {string|number} studentId - Student's MySQL ID
 * @param {Function} callback - Callback function that receives array of grades
 * @returns {Function} Unsubscribe function
 */
function subscribeToStudentGrades(studentId, callback) {
  return gradesApi.subscribeToStudentGrades(studentId, callback)
}

/**
 * Deletes a grade record
 * @param {string|number} gradeId - Grade MySQL ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteGrade(gradeId) {
  if (!gradeId) return false
  await gradesApi.deleteGrade(gradeId)
  return true
}

export {
  createGrade,
  updateGrade,
  getGradesByStudent,
  getGradesByCourse,
  getGradesByStudentAndCourse,
  subscribeToStudentGrades,
  deleteGrade,
}



