// API Client for Express.js backend
// Replaces direct Firestore calls for heavy data operations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const CSRF_TOKEN = import.meta.env.VITE_CSRF_TOKEN

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
  // Create AbortController if signal is provided, otherwise create a new one
  const abortController = options.signal ? null : new AbortController()
  const signal = options.signal || abortController.signal
  
  try {
    // Get auth token (may fail for registration, but that's handled by verifyTokenOnly middleware)
    let token = null
    try {
      token = await getAuthToken()
    } catch (authError) {
      // For registration endpoints, token might not be available yet
      // The backend verifyTokenOnly middleware will handle this
      console.warn('No auth token available, proceeding without Authorization header')
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Add CSRF token if configured (registration endpoints are excluded from CSRF check)
    if (CSRF_TOKEN) {
      headers['x-csrf-token'] = CSRF_TOKEN
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal // Add abort signal to fetch request
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      let errorMessage = error.error || error.message || `HTTP ${response.status}`
      
      // Include validation errors if present
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map(e => `${e.param || e.field}: ${e.msg || e.message}`).join(', ')
        if (validationErrors) {
          errorMessage += ` (${validationErrors})`
        }
      }
      
      // Include status code in error message for better debugging
      if (response.status === 500) {
        throw new Error(`Server error (500): ${errorMessage}. Please check the backend logs.`)
      } else if (response.status === 403) {
        throw new Error(`Access denied (403): ${errorMessage}`)
      } else if (response.status === 401) {
        throw new Error(`Authentication failed (401): ${errorMessage}`)
      } else if (response.status === 400) {
        throw new Error(`Bad request (400): ${errorMessage}`)
      }
      
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    // Handle aborted requests (cancelled)
    if (error.name === 'AbortError') {
      console.log('⏸️ Request cancelled:', endpoint)
      throw new Error('Request was cancelled')
    }
    
    // Handle network errors (Failed to fetch, connection refused, etc.)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError' || error.message.includes('fetch')) {
      const apiUrl = `${API_BASE_URL}${endpoint}`
      console.error('❌ Network error connecting to:', apiUrl)
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        apiBaseUrl: API_BASE_URL,
        endpoint: endpoint,
        fullUrl: apiUrl
      })
      throw new Error(`Cannot connect to server at ${apiUrl}. Please ensure the backend server is running on ${API_BASE_URL.replace('/api', '')}`)
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

