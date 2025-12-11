// Service helpers for managing professors
// Now uses Express.js + MySQL backend via API
import * as professorsApi from './api/professorsApi'

async function addProfessor(profile) {
  const professor = await professorsApi.createProfessor(profile)
  return professor.id
}

async function setProfessor(uid, profile) {
  const professor = await professorsApi.setProfessor(uid, profile)
  return professor ? { ...professor, role: 'Professor' } : null
}

async function getProfessorByUid(uid) {
  const professor = await professorsApi.getProfessorByFirebaseUid(uid)
  return professor ? { ...professor, role: 'Professor' } : null
}

async function getProfessorByEmail(email) {
  const professor = await professorsApi.getProfessorByEmail(email)
  return professor ? { ...professor, role: 'Professor' } : null
}

async function listProfessors(filter = {}) {
  const professors = await professorsApi.listProfessors(filter)
  return professors.map(p => ({ ...p, role: 'Professor' }))
}

/**
 * Update professor by MySQL ID or Firebase UID
 * @param {string|number} id - MySQL ID (number) or Firebase UID (string)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated professor or null
 */
async function updateProfessor(id, updates) {
  let professorId = id
  
  // If id is not a number, assume it's a Firebase UID and look up the MySQL ID
  if (id && typeof id !== 'number' && !/^\d+$/.test(String(id))) {
    const professor = await getProfessorByUid(id)
    if (!professor) {
      return null
    }
    professorId = professor.id
  }
  
  const professor = await professorsApi.updateProfessor(professorId, updates)
  return professor ? { ...professor, role: 'Professor' } : null
}

/**
 * Delete professor by MySQL ID or Firebase UID
 * @param {string|number} id - MySQL ID (number) or Firebase UID (string)
 * @returns {Promise<boolean>} Success status
 */
async function deleteProfessor(id) {
  let professorId = id
  
  // If id is not a number, assume it's a Firebase UID and look up the MySQL ID
  if (id && typeof id !== 'number' && !/^\d+$/.test(String(id))) {
    const professor = await getProfessorByUid(id)
    if (!professor) {
      return false
    }
    professorId = professor.id
  }
  
  await professorsApi.deleteProfessor(professorId)
  return true
}

export { addProfessor, setProfessor, getProfessorByUid, getProfessorByEmail, listProfessors, updateProfessor, deleteProfessor }
