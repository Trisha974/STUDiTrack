/**
 * Alert Helper Utilities
 * Centralized alert/notification management functions
 */

/**
 * Create a new alert object
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info', 'general'
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {boolean} read - Whether alert is read
 * @returns {Object} Alert object
 */
export function createAlert(type, title, message, read = false) {
  return {
    id: Date.now() + Math.random(),
    type,
    title,
    message,
    timestamp: new Date(),
    read
  }
}

/**
 * Add alert to alerts array
 * @param {Array} alerts - Current alerts array
 * @param {string} type - Alert type
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {boolean} read - Whether alert is read
 * @returns {Array} Updated alerts array
 */
export function addAlert(alerts, type, title, message, read = false) {
  const newAlert = createAlert(type, title, message, read)
  return [newAlert, ...alerts]
}

/**
 * Common alert messages
 */
export const ALERT_MESSAGES = {
  STUDENT_ADDED: (name, id) => `${name} (${id}) has been added successfully`,
  STUDENT_UPDATED: (name, id) => `${name} (${id}) has been updated successfully`,
  STUDENT_REMOVED: (name, id) => `${name} (${id}) has been removed`,
  SUBJECT_ADDED: (name, code) => `${name} (${code}) has been added successfully`,
  SUBJECT_UPDATED: (name, code) => `${name} (${code}) has been updated successfully`,
  SUBJECT_ARCHIVED: (name, code) => `${name} (${code}) has been archived`,
  SUBJECT_RESTORED: (name, code) => `${name} (${code}) has been restored`,
  SUBJECT_DELETED: (name, code) => `${name} (${code}) has been deleted`,
  ENROLLMENT_ADDED: (studentName, subjectCode) => `${studentName} has been enrolled in ${subjectCode}`,
  ENROLLMENT_REMOVED: (studentName, subjectCode) => `${studentName} has been unenrolled from ${subjectCode}`,
  GRADES_SAVED: (subjectCode) => `Grades for ${subjectCode} have been saved`,
  ATTENDANCE_SAVED: (subjectCode, date) => `Attendance for ${subjectCode} on ${date} has been saved`,
  PROFILE_UPDATED: 'Your profile has been updated successfully',
  CSV_IMPORT_SUCCESS: (count) => `Successfully imported ${count} student(s)`,
  CSV_IMPORT_ERROR: (errors) => `Import completed with ${errors.length} error(s)`,
  MISSING_FIELDS: 'Please fill in all required fields',
  INVALID_STUDENT_ID: 'Invalid Student ID format',
  DUPLICATE_STUDENT: (id) => `Student with ID ${id} already exists`,
  DUPLICATE_SUBJECT: (code) => `Subject with code ${code} already exists`,
  STUDENT_NOT_FOUND: (id) => `Student with ID ${id} not found`,
  SUBJECT_NOT_FOUND: (code) => `Subject with code ${code} not found`,
  SAVE_ERROR: 'Failed to save. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication error. Please sign in again.'
}

