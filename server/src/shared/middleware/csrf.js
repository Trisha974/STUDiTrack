const crypto = require('crypto')

/**
 * Enhanced CSRF protection middleware
 * Protects against Cross-Site Request Forgery attacks
 */

// Store CSRF tokens in memory (in production, use Redis or similar)
const csrfTokens = new Map()
const TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now()
  for (const [token, expiry] of csrfTokens.entries()) {
    if (now > expiry) {
      csrfTokens.delete(token)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes

/**
 * Generate a CSRF token
 */
function generateCSRFToken() {
  const token = crypto.randomBytes(32).toString('hex')
  const expiry = Date.now() + TOKEN_EXPIRY
  csrfTokens.set(token, expiry)
  return token
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken(token) {
  if (!token) return false
  
  const expiry = csrfTokens.get(token)
  if (!expiry) return false
  
  if (Date.now() > expiry) {
    csrfTokens.delete(token)
    return false
  }
  
  // Token is valid, but don't delete it yet (allow reuse within expiry)
  return true
}

/**
 * CSRF protection middleware
 */
function csrfProtection(req, res, next) {
  // Skip CSRF for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(req.method)) {
    return next()
  }
  
  // Public endpoints that need to allow registration
  const PUBLIC_ENDPOINTS = [
    '/api/students',
    '/api/professors'
  ]
  
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
    req.path === endpoint || req.path.startsWith(endpoint + '/')
  )
  
  // For registration endpoints, use a simpler check
  if (isPublicEndpoint && req.method === 'POST') {
    // Use environment variable CSRF secret for registration
    const CSRF_SECRET = process.env.CSRF_SECRET
    if (CSRF_SECRET) {
      const token = req.headers['x-csrf-token']
      if (!token || token !== CSRF_SECRET) {
        console.warn('🚨 CSRF token validation failed for registration:', {
          ip: req.ip,
          path: req.path,
          hasToken: !!token,
          timestamp: new Date().toISOString()
        })
        return res.status(403).json({ error: 'Invalid or missing CSRF token' })
      }
    }
    return next()
  }
  
  // For authenticated endpoints, require token verification
  const token = req.headers['x-csrf-token'] || req.headers['x-csrf-token']
  
  if (!token) {
    console.warn('🚨 CSRF token missing:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    })
    return res.status(403).json({ error: 'CSRF token required' })
  }
  
  // Check if it's the static secret (for backward compatibility)
  const CSRF_SECRET = process.env.CSRF_SECRET
  if (CSRF_SECRET && token === CSRF_SECRET) {
    return next()
  }
  
  // Verify dynamic token
  if (!verifyCSRFToken(token)) {
    console.warn('🚨 CSRF token validation failed:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    })
    return res.status(403).json({ error: 'Invalid or expired CSRF token' })
  }
  
  next()
}

/**
 * Endpoint to get CSRF token (for authenticated users)
 */
function getCSRFToken(req, res) {
  // Only allow authenticated users to get CSRF tokens
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  
  const token = generateCSRFToken()
  res.json({ csrfToken: token })
}

module.exports = {
  csrfProtection,
  getCSRFToken,
  generateCSRFToken,
  verifyCSRFToken
}

