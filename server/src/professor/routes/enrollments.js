const express = require('express')
const router = express.Router()
const {
  getEnrollmentsByStudent,
  getEnrollmentsByCourse,
  createEnrollment,
  deleteEnrollment,
  deleteEnrollmentByStudentAndCourse
} = require('../controllers/enrollmentsController')
const { verifyToken, requireProfessor } = require('../../shared/middleware/auth')
const { validateEnrollment } = require('../../shared/middleware/validation')

router.use(verifyToken)

router.get('/student/:studentId', getEnrollmentsByStudent)

router.get('/student', getEnrollmentsByStudent)

router.get('/course/:courseId', getEnrollmentsByCourse)

router.post('/', requireProfessor, validateEnrollment, createEnrollment)

router.delete('/:id', requireProfessor, deleteEnrollment)

router.delete('/', requireProfessor, deleteEnrollmentByStudentAndCourse)

module.exports = router

