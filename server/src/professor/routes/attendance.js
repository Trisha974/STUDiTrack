const express = require('express')
const router = express.Router()
const {
  getAttendanceByStudent,
  getAttendanceByCourse,
  getAttendanceByStudentAndCourse,
  createAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController')
const { verifyToken, requireProfessor } = require('../../shared/middleware/auth')
const { validateAttendance } = require('../../shared/middleware/validation')

router.use(verifyToken)

router.get('/student/:studentId', getAttendanceByStudent)

router.get('/course/:courseId', getAttendanceByCourse)

router.get('/', getAttendanceByStudentAndCourse)

router.post('/', requireProfessor, validateAttendance, createAttendance)

router.put('/:id', requireProfessor, validateAttendance, updateAttendance)

router.delete('/:id', requireProfessor, deleteAttendance)

module.exports = router

