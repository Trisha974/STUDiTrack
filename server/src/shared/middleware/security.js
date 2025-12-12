const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const helmet = require('helmet')
const hpp = require('hpp')
const validator = require('validator')

/**
 * Security middleware to protect against common attacks including Burp Suite testing
 */


const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {

      return req.path === '/api/health'
    },
    handler: (req, res) => {

      console.warn('🚨 Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      })
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      })
    }
  })
}


const generalLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again later'
)


const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts, please try again later'
)


const registrationLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  'Too many registration attempts, please try again later'
)


const writeLimiter = createRateLimiter(
  15 * 60 * 1000,
  50,
  'Too many write operations, please try again later'
)


const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 100,
  maxDelayMs: 2000,
  skip: (req) => req.path === '/api/health'
})

/**
 * Security headers middleware using Helmet
 * Protects against XSS, clickjacking, MIME sniffing, etc.
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
})

/**
 * Input sanitization middleware
 * Protects against XSS, SQL injection, and other injection attacks
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item))
    }
    
    const sanitized = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {

        let sanitizedValue = value
        

        sanitizedValue = sanitizedValue.replace(/['";\\]/g, '')
        

        sanitizedValue = sanitizedValue.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        sanitizedValue = sanitizedValue.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        

        sanitizedValue = validator.escape(sanitizedValue)
        

        sanitizedValue = sanitizedValue.trim()
        
        sanitized[key] = sanitizedValue
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitizeObject(req.body)
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    req.query = sanitizeObject(req.query)
  }
  
  next()
}

/**
 * HTTP Parameter Pollution protection
 * Prevents parameter pollution attacks
 */
const hppProtection = hpp({
  whitelist: ['id', 'studentId', 'professorId', 'courseId', 'enrollmentId']
})

/**
 * Request logging for security monitoring
 */
const securityLogger = (req, res, next) => {
  const startTime = Date.now()
  

  const suspiciousPatterns = [
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\.\./i,
    /eval\(/i,
    /exec\(/i
  ]
  
  const checkSuspicious = (str) => {
    if (!str || typeof str !== 'string') return false
    return suspiciousPatterns.some(pattern => pattern.test(str))
  }
  
  const isSuspicious = 
    checkSuspicious(JSON.stringify(req.body)) ||
    checkSuspicious(JSON.stringify(req.query)) ||
    checkSuspicious(req.path) ||
    checkSuspicious(req.get('user-agent') || '')
  
  if (isSuspicious) {
    console.warn('🚨 Suspicious request detected:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('user-agent'),
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString()
    })
  }
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    if (res.statusCode >= 400 || isSuspicious) {
      console.log('📊 Request:', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        suspicious: isSuspicious
      })
    }
  })
  
  next()
}

/**
 * IP-based security checks
 */
const ipSecurity = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress
  

  const userAgent = req.get('user-agent') || ''
  const suspiciousUserAgents = [
    'burpsuite',
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'zap',
    'w3af'
  ]
  
  if (suspiciousUserAgents.some(ua => userAgent.toLowerCase().includes(ua))) {
    console.warn('🚨 Blocked suspicious user agent:', {
      ip,
      userAgent,
      path: req.path,
      timestamp: new Date().toISOString()
    })
    return res.status(403).json({
      error: 'Access denied'
    })
  }
  

  const attackHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip',
    'x-remote-ip',
    'x-remote-addr'
  ]
  

  const ipHeaders = attackHeaders.filter(header => req.get(header))
  if (ipHeaders.length > 2) {
    console.warn('🚨 Multiple IP headers detected (possible IP spoofing):', {
      ip,
      headers: ipHeaders,
      path: req.path,
      timestamp: new Date().toISOString()
    })
  }
  
  next()
}

/**
 * Request size validation
 */
const requestSizeValidator = (req, res, next) => {
  const contentLength = req.get('content-length')
  const maxSize = 50 * 1024 * 1024
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      error: 'Request entity too large',
      maxSize: `${maxSize / 1024 / 1024}MB`
    })
  }
  
  next()
}

/**
 * Method validation - only allow standard HTTP methods
 */
const methodValidator = (req, res, next) => {
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
  
  if (!allowedMethods.includes(req.method)) {
    console.warn('🚨 Invalid HTTP method:', {
      method: req.method,
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    })
    return res.status(405).json({
      error: 'Method not allowed',
      allowedMethods
    })
  }
  
  next()
}

module.exports = {
  generalLimiter,
  authLimiter,
  registrationLimiter,
  writeLimiter,
  speedLimiter,
  securityHeaders,
  sanitizeInput,
  hppProtection,
  securityLogger,
  ipSecurity,
  requestSizeValidator,
  methodValidator
}

