const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/auth')

/**
 * GET /api/auth/verify
 * Verifies that the user is authenticated and returns their role
 * Used by frontend to verify authentication status
 */
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role
    }
  })
})

module.exports = router

