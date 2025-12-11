const admin = require('firebase-admin')
const Student = require('../../student/models/Student')
const Professor = require('../../professor/models/Professor')

let firebaseAdminInitialized = false

if (!admin.apps.length) {
  const hasFirebaseConfig =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL

  if (hasFirebaseConfig) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      })
      firebaseAdminInitialized = true
      console.log('✅ Firebase Admin SDK initialized successfully')
    } catch (error) {
      console.warn('⚠️ Firebase Admin SDK initialization failed:', error.message)
      console.warn('⚠️ Token verification will not work until Firebase Admin SDK is configured')
    }
  } else {
    console.warn('⚠️ Firebase Admin SDK not configured. Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env')
    console.warn('⚠️ Token verification will not work until Firebase Admin SDK is configured')
    console.warn('⚠️ NOTE: This is about the Firebase Admin SDK library, NOT user roles. User roles are ONLY: Professor and Student')
  }
} else {
  firebaseAdminInitialized = true
}

const VALID_ROLES = ['Professor', 'Student']

async function getUserRoleFromDB(uid) {
  try {

    const professor = await Professor.findByFirebaseUid(uid)
    if (professor) return 'Professor'

const student = await Student.findByFirebaseUid(uid)
    if (student) return 'Student'

    return null
  } catch (error) {
    console.error('Error getting user role from database:', error)
    return null
  }
}

async function verifyTokenOnly(req, res, next) {
  try {
    if (!firebaseAdminInitialized) {
      return res.status(503).json({
        error: 'Authentication service not configured. Please configure Firebase Admin SDK credentials in .env file. (NOTE: This is about the SDK library, not user roles. User roles are ONLY: Professor and Student)'
      })
    }

    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await admin.auth().verifyIdToken(token)

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    }

    next()
  } catch (error) {
    console.error('Token verification error:', error)
    if (error.code === 'auth/argument-error') {
      return res.status(503).json({ error: 'Firebase Admin SDK not properly configured. (NOTE: This is about the SDK library, not user roles. User roles are ONLY: Professor and Student)' })
    }
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

async function verifyToken(req, res, next) {
  try {
    if (!firebaseAdminInitialized) {
      return res.status(503).json({
        error: 'Authentication service not configured. Please configure Firebase Admin SDK credentials in .env file. (NOTE: This is about the SDK library, not user roles. User roles are ONLY: Professor and Student)'
      })
    }

    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await admin.auth().verifyIdToken(token)

const role = await getUserRoleFromDB(decodedToken.uid)

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(403).json({ error: 'User role not found or invalid. Only Professor and Student roles are allowed.' })
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: role
    }

    next()
  } catch (error) {
    console.error('Token verification error:', error)
    if (error.code === 'auth/argument-error') {
      return res.status(503).json({ error: 'Firebase Admin SDK not properly configured. (NOTE: This is about the SDK library, not user roles. User roles are ONLY: Professor and Student)' })
    }
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function requireRole(...roles) {

  const invalidRoles = roles.filter(r => !VALID_ROLES.includes(r))
  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles requested: ${invalidRoles.join(', ')}. Only 'Professor' and 'Student' are allowed.`)
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!req.user.role || !VALID_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Invalid user role' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions. Required role: ' + roles.join(' or ') })
    }

    next()
  }
}

function requireProfessor(req, res, next) {
  return requireRole('Professor')(req, res, next)
}

function requireStudent(req, res, next) {
  return requireRole('Student')(req, res, next)
}

module.exports = {
  verifyToken,
  verifyTokenOnly,
  requireRole,
  requireProfessor,
  requireStudent,
  getUserRoleFromDB
}

