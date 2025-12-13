const express = require('express')
const cors = require('cors')
require('dotenv').config()

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
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:5177',
  'http://127.0.0.1:5178',
]

if (process.env.PRODUCTION_FRONTEND_URL) {
  allowedOrigins.push(process.env.PRODUCTION_FRONTEND_URL)
}

if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`)
}

allowedOrigins.push('https://studentitrack.vercel.app')

app.set('trust proxy', 1)


app.use(securityHeaders)

app.use(methodValidator)

app.use(requestSizeValidator)

app.use(ipSecurity)

app.use(securityLogger)

app.use(cors({
  origin: function(origin, callback) {
    const req = arguments[2]
    if (!origin) {
      if (NODE_ENV === 'production') {
        if (req && (req.path === '/api/health' || req.path === '/health')) {
          console.log('✅ CORS: Allowing health check without origin')
          return callback(null, true)
        }
        console.warn('🚨 CORS: Blocked request with no origin in production')
        return callback(new Error('CORS: Origin required'))
      }
      console.log('✅ CORS: Allowing request with no origin (development)')
      return callback(null, true)
    }
    
    if (allowedOrigins.includes(origin)) {
      if (NODE_ENV === 'development') {
      console.log(`✅ CORS: Allowing origin: ${origin}`)
      }
      callback(null, true)
    } else {
      if (NODE_ENV === 'production') {
        console.warn(`🚨 CORS blocked origin: ${origin}`)
        return callback(new Error(`Not allowed by CORS. Origin: ${origin}`))
      }
      
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
  maxAge: 86400
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(hppProtection)

app.use(sanitizeInput)

app.use(speedLimiter)

app.use('/api', generalLimiter)

app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next)
  }
  next()
})

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

app.use(csrfProtection)

app.use('/api/students', require('./student/routes/students'))
app.use('/api/professors', require('./professor/routes/professors'))
app.use('/api/courses', require('./professor/routes/courses'))
app.use('/api/enrollments', require('./professor/routes/enrollments'))
app.use('/api/grades', require('./professor/routes/grades'))
app.use('/api/attendance', require('./professor/routes/attendance'))
app.use('/api/notifications', require('./shared/routes/notifications'))
app.use('/api/reports', require('./professor/routes/reports'))
app.use('/api/auth', require('./shared/routes/auth'))

app.get('/api/csrf-token', require('./shared/middleware/auth').verifyTokenOnly, getCSRFToken)

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

