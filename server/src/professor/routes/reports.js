const express = require('express')
const router = express.Router()
const {
  getStudentReport,
  getCourseReport
} = require('../controllers/reportsController')
const { verifyToken } = require('../../shared/middleware/auth')

router.use(verifyToken)

router.get('/student/:studentId', getStudentReport)

router.get('/course/:courseId', getCourseReport)

module.exports = router

