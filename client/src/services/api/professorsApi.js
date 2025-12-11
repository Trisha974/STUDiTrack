
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
    photoUrl: data.photoUrl || data.photo_url || data.photoURL || null
  })
}

export async function updateProfessor(id, data) {
  return apiClient.put(`/professors/${id}`, {
    name: data.name,
    email: data.email,
    department: data.department,
    photoUrl: data.photoUrl || data.photo_url || data.photoURL || null
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

export async function setProfessor(uid, profile) {
  if (!uid) {
    throw new Error('Firebase UID is required')
  }

  // Ensure required fields are present
  if (!profile.name || !profile.name.trim()) {
    throw new Error('Name is required')
  }
  if (!profile.email || !profile.email.trim()) {
    throw new Error('Email is required')
  }

  let professor = await getProfessorByFirebaseUid(uid).catch(() => null)

  if (professor && professor.id && !isNaN(professor.id)) {
    // Update existing professor - only send fields that should be updated
    const updateData = {
      name: profile.name?.trim(),
      email: profile.email?.trim(),
      department: profile.department?.trim() || null,
      photoUrl: profile.photoUrl || profile.photo_url || profile.photoURL || null
    }

    // Remove undefined and empty string fields (but keep null for department/photoUrl)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || (key !== 'department' && key !== 'photoUrl' && updateData[key] === '')) {
        delete updateData[key]
      }
    })

    // Ensure at least name and email are present for update
    if (!updateData.name || !updateData.email) {
      throw new Error('Name and email are required for profile update')
    }

    return updateProfessor(professor.id, updateData)
  } else {
    // Create new professor
    const createData = {
      name: profile.name?.trim(),
      email: profile.email?.trim(),
      department: profile.department?.trim() || null,
      photoUrl: profile.photoUrl || profile.photo_url || profile.photoURL || null,
      firebase_uid: uid
    }

    // Validate required fields for creation
    if (!createData.name || !createData.email) {
      throw new Error('Name and email are required to create professor profile')
    }

    return createProfessor(createData)
  }
}

