// API service for professors - replaces Firestore calls
import apiClient from './apiClient'

export async function getProfessorByFirebaseUid(uid) {
  try {
    const professor = await apiClient.get(`/professors/firebase/${uid}`)
    return professor
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null
    }
    throw error
  }
}

export async function getProfessorById(id) {
  try {
    const professor = await apiClient.get(`/professors/${id}`)
    return professor
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null
    }
    throw error
  }
}

export async function getProfessorByEmail(email) {
  try {
    const professor = await apiClient.get(`/professors/email/${encodeURIComponent(email)}`)
    return professor
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null
    }
    throw error
  }
}

export async function createProfessor(data) {
  return apiClient.post('/professors', {
    firebase_uid: data.firebase_uid || data.uid,
    name: data.name,
    email: data.email,
    department: data.department,
    photoUrl: data.photoUrl || data.photo_url
  })
}

export async function updateProfessor(id, data) {
  return apiClient.put(`/professors/${id}`, {
    name: data.name,
    email: data.email,
    department: data.department,
    photoUrl: data.photoUrl || data.photo_url
  })
}

export async function listProfessors(filters = {}) {
  const queryParams = new URLSearchParams()
  if (filters.department) queryParams.append('department', filters.department)
  
  const endpoint = queryParams.toString() 
    ? `/professors?${queryParams.toString()}`
    : '/professors'
  
  return apiClient.get(endpoint)
}

// Legacy compatibility - maps to new API
export async function setProfessor(uid, profile) {
  // First try to find existing professor
  let professor = await getProfessorByFirebaseUid(uid).catch(() => null)
  
  if (professor) {
    // Update existing
    return updateProfessor(professor.id, {
      ...profile,
      firebase_uid: uid
    })
  } else {
    // Create new
    return createProfessor({
      ...profile,
      firebase_uid: uid
    })
  }
}

