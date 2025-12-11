const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const CSRF_TOKEN = import.meta.env.VITE_CSRF_TOKEN

// Cache for CSRF token
let csrfTokenCache = null
let csrfTokenExpiry = 0
const CSRF_TOKEN_TTL = 50 * 60 * 1000 // 50 minutes (tokens expire after 1 hour)

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

/**
 * Get CSRF token - fetches from server if needed
 */
async function getCSRFToken() {
  // Use environment variable token if available (for registration)
  if (CSRF_TOKEN) {
    return CSRF_TOKEN
  }
  
  // Check cache
  if (csrfTokenCache && Date.now() < csrfTokenExpiry) {
    return csrfTokenCache
  }
  
  // Try to fetch token from server (requires authentication)
  try {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      csrfTokenCache = data.csrfToken
      csrfTokenExpiry = Date.now() + CSRF_TOKEN_TTL
      return csrfTokenCache
    }
  } catch (error) {
    // If we can't get a token, continue without it (some endpoints don't require it)
    console.warn('Could not fetch CSRF token:', error)
  }
  
  return null
}

async function apiRequest(endpoint, options = {}) {
  const abortController = options.signal ? null : new AbortController()
  const signal = options.signal || abortController.signal
  
  try {
    let token = null
    try {
      token = await getAuthToken()
    } catch (authError) {
      console.warn('No auth token available, proceeding without Authorization header')
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Get CSRF token for state-changing operations
    const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
    if (unsafeMethods.includes(options.method || 'GET')) {
      const csrfToken = await getCSRFToken()
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      let errorMessage = error.error || error.message || `HTTP ${response.status}`
      
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map(e => `${e.param || e.field}: ${e.msg || e.message}`).join(', ')
        if (validationErrors) {
          errorMessage += ` (${validationErrors})`
        }
      }
      
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
    if (error.name === 'AbortError') {
      console.log('⏸️ Request cancelled:', endpoint)
      throw new Error('Request was cancelled')
    }
    
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
    throw error
  }
}

export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' })
}

export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' })
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete
}

