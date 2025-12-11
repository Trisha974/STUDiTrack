const express = require('express')
const router = express.Router()
const {
  getAllCourses,
  getCourseById,
  getCourseByCode,
  getCoursesByProfessor,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/coursesController')
const { verifyToken, requireProfessor } = require('../../shared/middleware/auth')
const { validateCourse, validateCourseUpdate, validateCourseId } = require('../../shared/middleware/validation')

// All routes require authentication
router.use(verifyToken)

// Get all courses (both professors and students can view)
router.get('/', getAllCourses)

// Get courses by professor (both professors and students can view)
router.get('/professor/:professorId', getCoursesByProfessor)

// Get course by code (both professors and students can view)
// Supports optional professorId query parameter: /courses/code/CCE106?professorId=1
router.get('/code/:code', getCourseByCode)

// Get course by MySQL ID (both professors and students can view, must be last to avoid conflicts)
router.get('/:id', validateCourseId, getCourseById)

// Create course (only professors)
router.post('/', requireProfessor, validateCourse, createCourse)

// Update course (only professors) - use update validation (fields optional)
router.put('/:id', requireProfessor, validateCourseId, validateCourseUpdate, updateCourse)

// Delete course (only professors)
router.delete('/:id', requireProfessor, validateCourseId, deleteCourse)

module.exports = router

