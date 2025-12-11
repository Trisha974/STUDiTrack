const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Security middleware
const {
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
} = require('./shared/middleware/security')

const { csrfProtection, getCSRFToken } = require('./shared/middleware/csrf')

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5177'
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173', // Common Vite default
  'http://localhost:5174', // Alternative Vite port
  'http://localhost:5175', // Alternative Vite port
  'http://localhost:5176', // Alternative Vite port
  'http://localhost:5177', // Alternative port
  'http://localhost:5178', // Alternative port
  'http://localhost:3000', // Common React default
  'http://127.0.0.1:5173', // IPv4 localhost
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:5177',
  'http://127.0.0.1:5178',
]

// Add production frontend URL if set
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`)
}
if (process.env.PRODUCTION_FRONTEND_URL) {
  allowedOrigins.push(process.env.PRODUCTION_FRONTEND_URL)
}

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1)

// ============================================
// SECURITY MIDDLEWARE (Applied in order)
// ============================================

// 1. Security headers (Helmet)
app.use(securityHeaders)

// 2. Method validation
app.use(methodValidator)

// 3. Request size validation
app.use(requestSizeValidator)

// 4. IP-based security checks
app.use(ipSecurity)

// 5. Security logging
app.use(securityLogger)

// 6. CORS configuration (more restrictive in production)
app.use(cors({
  origin: (origin, callback) => {
    // In production, reject requests with no origin (except for same-origin requests)
    if (!origin) {
      if (NODE_ENV === 'production') {
        console.warn('🚨 CORS: Blocked request with no origin in production')
        return callback(new Error('CORS: Origin required'))
      }
      // Allow in development for tools like Postman
      console.log('✅ CORS: Allowing request with no origin (development)')
      return callback(null, true)
    }
    
    if (allowedOrigins.includes(origin)) {
      if (NODE_ENV === 'development') {
        console.log(`✅ CORS: Allowing origin: ${origin}`)
      }
      callback(null, true)
    } else {
      // In production, be strict
      if (NODE_ENV === 'production') {
        console.warn(`🚨 CORS blocked origin: ${origin}`)
        return callback(new Error(`Not allowed by CORS. Origin: ${origin}`))
      }
      
      // In development, allow localhost variations
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log(`✅ CORS: Allowing localhost origin in development: ${origin}`)
        callback(null, true)
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`)
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`))
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  exposedHeaders: ['x-csrf-token'],
  maxAge: 86400 // 24 hours
}))

// 7. Body parsing with limits
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 8. HTTP Parameter Pollution protection
app.use(hppProtection)

// 9. Input sanitization (protects against XSS, SQL injection)
app.use(sanitizeInput)

// 10. Speed limiting (slow down after burst)
app.use(speedLimiter)

// 11. General rate limiting
app.use('/api', generalLimiter)

// 12. Write operation rate limiting
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next)
  }
  next()
})

// 13. Authentication endpoint rate limiting
app.use('/api/students', (req, res, next) => {
  if (req.path === '/api/students' && req.method === 'POST') {
    return registrationLimiter(req, res, next)
  }
  next()
})

app.use('/api/professors', (req, res, next) => {
  if (req.path === '/api/professors' && req.method === 'POST') {
    return registrationLimiter(req, res, next)
  }
  next()
})

// 14. CSRF protection
app.use(csrfProtection)

app.use('/api/students', require('./student/routes/students'))
app.use('/api/professors', require('./professor/routes/professors'))
app.use('/api/courses', require('./professor/routes/courses'))
app.use('/api/enrollments', require('./professor/routes/enrollments'))
app.use('/api/grades', require('./professor/routes/grades'))
app.use('/api/attendance', require('./professor/routes/attendance'))
app.use('/api/notifications', require('./shared/routes/notifications'))
app.use('/api/reports', require('./professor/routes/reports'))

// CSRF token endpoint (requires authentication)
app.get('/api/csrf-token', require('./shared/middleware/auth').verifyTokenOnly, getCSRFToken)

// Health check endpoint (no rate limiting)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  })
})

const errorHandler = require('./shared/middleware/errorHandler')
app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API available at http://localhost:${PORT}/api`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`)
    console.error(`\n💡 Solutions:`)
    console.error(`   1. Find and kill the process:`)
    console.error(`      netstat -ano | findstr :${PORT}`)
    console.error(`      taskkill /PID <PID> /F`)
    console.error(`   2. Change PORT in server/.env file to a different port (e.g., 5001)`)
    console.error(`   3. Wait a few seconds and try again\n`)
    process.exit(1)
  } else {
    console.error('❌ Server error:', err)
    process.exit(1)
  }
})

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

