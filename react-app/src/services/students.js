// Service helpers for managing students
// Now uses Express.js + MySQL backend via API
import * as studentsApi from './api/studentsApi'

async function addStudent(profile) {
  const student = await studentsApi.createStudent(profile)
  return student.id
}

async function setStudent(uid, profile) {
  const student = await studentsApi.setStudent(uid, profile)
  if (!student) return null
  return {
    ...student,
    role: 'Student',
    studentId: student.student_id || student.studentId,
    photoURL: student.photo_url || student.photoURL
  }
}

async function getStudentByUid(uid) {
  const student = await studentsApi.getStudentByFirebaseUid(uid)
  // Map to expected format with role and normalize field names
  if (!student) return null
  return {
    ...student,
    role: 'Student',
    // Map snake_case to camelCase for frontend compatibility
    studentId: student.student_id || student.studentId,
    photoURL: student.photo_url || student.photoURL
  }
}

async function getStudentByEmail(email) {
  const student = await studentsApi.getStudentByEmail(email)
  if (!student) return null
  return {
    ...student,
    role: 'Student',
    studentId: student.student_id || student.studentId,
    photoURL: student.photo_url || student.photoURL
  }
}

async function getStudentByNumericalId(studentId) {
  if (!studentId || !/^\d+$/.test(studentId)) return null
  const student = await studentsApi.getStudentByNumericalId(studentId)
  if (!student) return null
  return {
    ...student,
    role: 'Student',
    studentId: student.student_id || student.studentId,
    photoURL: student.photo_url || student.photoURL
  }
}

async function listStudents(filter = {}) {
  const students = await studentsApi.listStudents(filter)
  return students.map(s => ({
    ...s,
    role: 'Student',
    studentId: s.student_id || s.studentId,
    photoURL: s.photo_url || s.photoURL
  }))
}

/**
 * Update student by MySQL ID or Firebase UID
 * @param {string|number} id - MySQL ID (number) or Firebase UID (string)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated student or null
 */
async function updateStudent(id, updates) {
  let studentId = id
  
  // If id is not a number, assume it's a Firebase UID and look up the MySQL ID
  if (id && typeof id !== 'number' && !/^\d+$/.test(String(id))) {
    const student = await getStudentByUid(id)
    if (!student) {
      return null
    }
    studentId = student.id
  }
  
  const student = await studentsApi.updateStudent(studentId, updates)
  if (!student) return null
  return {
    ...student,
    role: 'Student',
    studentId: student.student_id || student.studentId,
    photoURL: student.photo_url || student.photoURL
  }
}

/**
 * Delete student by MySQL ID or Firebase UID
 * @param {string|number} id - MySQL ID (number) or Firebase UID (string)
 * @returns {Promise<boolean>} Success status
 */
async function deleteStudent(id) {
  let studentId = id
  
  // If id is not a number, assume it's a Firebase UID and look up the MySQL ID
  if (id && typeof id !== 'number' && !/^\d+$/.test(String(id))) {
    const student = await getStudentByUid(id)
    if (!student) {
      return false
    }
    studentId = student.id
  }
  
  await studentsApi.deleteStudent(studentId)
  return true
}

export { addStudent, setStudent, getStudentByUid, getStudentByEmail, getStudentByNumericalId, listStudents, updateStudent, deleteStudent }
