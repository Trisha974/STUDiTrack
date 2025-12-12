/**
 * Validation Helper Utilities
 * Centralized validation functions used across the application
 */

/**
 * Normalize student ID - trim and convert to string
 * @param {any} value - Student ID value
 * @returns {string} Normalized student ID
 */
export function normalizeStudentId(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

/**
 * Normalize enrollment map - clean and deduplicate student IDs
 * @param {Object} enrollsMap - Enrollment map object
 * @returns {Object} Normalized enrollment map
 */
export function normalizeEnrollsMap(enrollsMap = {}) {
  const normalized = {}
  Object.keys(enrollsMap).forEach(subjectCode => {
    const ids = Array.isArray(enrollsMap[subjectCode]) ? enrollsMap[subjectCode] : []
    const cleaned = ids
      .map(normalizeStudentId)
      .filter(Boolean)
    normalized[subjectCode] = Array.from(new Set(cleaned))
  })
  return normalized
}

/**
 * Validate email format - STRICT: Only umindanao.edu.ph domain allowed
 * Professor format: ljorcullo@umindanao.edu.ph (lowercase letters/numbers only)
 * Student format: t.talamillo.141715.tc@umindanao.edu.ph (initials.surname.studentid.tc)
 * @param {string} email - Email to validate
 * @param {boolean} isStudent - Whether it's a student email
 * @returns {boolean} True if valid
 */
export function isValidEmail(email, isStudent = false) {
  if (!email) return false
  const trimmed = email.trim().toLowerCase()
  
  if (!trimmed.endsWith('@umindanao.edu.ph')) {
    return false
  }
  
  const STUDENT_EMAIL_REGEX = /^[a-z]+(\.[a-z]+)+\.\d+\.tc@umindanao\.edu\.ph$/
  const PROFESSOR_EMAIL_REGEX = /^[a-z0-9]+@umindanao\.edu\.ph$/
  
  return isStudent
    ? STUDENT_EMAIL_REGEX.test(trimmed)
    : PROFESSOR_EMAIL_REGEX.test(trimmed)
}

/**
 * Validate email domain - Only umindanao.edu.ph allowed
 * @param {string} email - Email to validate
 * @returns {boolean} True if domain is umindanao.edu.ph
 */
export function isValidEmailDomain(email) {
  if (!email) return false
  const trimmed = email.trim().toLowerCase()
  return trimmed.endsWith('@umindanao.edu.ph')
}

/**
 * Detect email type from format
 * Professor format: ljorcullo@umindanao.edu.ph (lowercase letters/numbers only)
 * Student format: t.talamillo.141715.tc@umindanao.edu.ph (initials.surname.studentid.tc)
 * @param {string} email - Email to check
 * @returns {string|null} 'student', 'professor', or null if invalid
 */
export function detectEmailType(email) {
  if (!email) return null
  const trimmed = email.trim().toLowerCase()
  
  if (!trimmed.endsWith('@umindanao.edu.ph')) {
    return null
  }
  
  const STUDENT_EMAIL_REGEX = /^[a-z]+(\.[a-z]+)+\.\d+\.tc@umindanao\.edu\.ph$/
  const PROFESSOR_EMAIL_REGEX = /^[a-z0-9]+@umindanao\.edu\.ph$/
  
  if (STUDENT_EMAIL_REGEX.test(trimmed)) {
    return 'student'
  }
  if (PROFESSOR_EMAIL_REGEX.test(trimmed)) {
    return 'professor'
  }
  
  return null
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets strength requirements
 */
export function isValidPassword(password) {
  if (!password || password.length < 8) return false
  return /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password) && 
         /[^A-Za-z0-9]/.test(password)
}

/**
 * Check password strength level
 * @param {string} password - Password to check
 * @returns {string} Strength level: 'weak', 'fair', 'good', 'strong'
 */
export function checkPasswordStrength(password) {
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  return ['weak', 'weak', 'fair', 'good', 'strong'][strength - 1] || 'weak'
}

/**
 * Validate student ID format (numerical only, reject legacy S101 format)
 * @param {string} studentId - Student ID to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateStudentId(studentId) {
  if (!studentId || !studentId.trim()) {
    return { valid: false, error: 'Student ID is required' }
  }
  

  if (/^S\d+$/i.test(studentId.trim())) {
    return { 
      valid: false, 
      error: 'Legacy student ID format (S101, S102, etc.) is no longer supported. Please use numerical IDs only (e.g., 141715, 142177).' 
    }
  }
  

  if (!/^\d+$/.test(studentId.trim())) {
    return { 
      valid: false, 
      error: 'Student ID must be numerical only (e.g., 141715, 142177). Legacy IDs like S101, S102 are no longer supported.' 
    }
  }
  
  return { valid: true }
}

/**
 * Validate student form data
 * @param {Object} studentData - { id, name, email }
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateStudentForm(studentData) {
  const errors = []
  
  if (!studentData.id || !studentData.id.trim()) {
    errors.push('Student ID is required')
  } else {
    const idValidation = validateStudentId(studentData.id)
    if (!idValidation.valid) {
      errors.push(idValidation.error)
    }
  }
  
  if (!studentData.name || !studentData.name.trim()) {
    errors.push('Student name is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate subject form data
 * @param {Object} subjectData - { code, name, credits, term }
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateSubjectForm(subjectData) {
  const errors = []
  
  if (!subjectData.code || !subjectData.code.trim()) {
    errors.push('Subject code is required')
  }
  
  if (!subjectData.name || !subjectData.name.trim()) {
    errors.push('Subject name is required')
  }
  
  if (!subjectData.credits || !subjectData.credits.toString().trim()) {
    errors.push('Credits are required')
  } else {
    const credits = parseFloat(subjectData.credits)
    if (isNaN(credits) || credits <= 0) {
      errors.push('Credits must be a positive number')
    }
  }
  
  if (!subjectData.term || !['first', 'second'].includes(subjectData.term)) {
    errors.push('Term must be "first" or "second"')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Check if email format is valid (basic check)
 * @param {string} email - Email to check
 * @returns {boolean} True if format looks valid
 */
export function isValidEmailFormat(email) {
  if (!email || !email.trim()) return false
  return /.+@.+\..+/.test(email.trim())
}

