// API Client for Express.js backend
// Replaces direct Firestore calls for heavy data operations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Get auth token from Firebase
async function getAuthToken() {
  try {
    const { auth } = await import('../../firebase')
    const user = auth.currentUser
    if (!user) {
      throw new Error('No authenticated user')
    }
    return await user.getIdToken()
  } catch (error) {
    console.error('Error getting auth token:', error)
    throw error
  }
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
  try {
    const token = await getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  } catch (error) {
    // Handle network errors (Failed to fetch, connection refused, etc.)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend server is running on http://localhost:5000')
    }
    // Re-throw other errors as-is
    throw error
  }
}

// GET request
export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' })
}

// POST request
export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// PUT request
export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// DELETE request
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' })
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete
}

