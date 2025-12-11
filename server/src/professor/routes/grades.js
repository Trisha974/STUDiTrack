const express = require('express')
const router = express.Router()
const {
  getGradesByStudent,
  getGradesByCourse,
  getGradesByStudentAndCourse,
  createGrade,
  updateGrade,
  deleteGrade
} = require('../controllers/gradesController')
const { verifyToken, requireProfessor } = require('../../shared/middleware/auth')
const { validateGrade } = require('../../shared/middleware/validation')

router.use(verifyToken)

router.get('/student/:studentId', getGradesByStudent)

router.get('/course/:courseId', getGradesByCourse)

router.get('/', getGradesByStudentAndCourse)

router.post('/', requireProfessor, validateGrade, createGrade)

router.put('/:id', requireProfessor, validateGrade, updateGrade)

router.delete('/:id', requireProfessor, deleteGrade)

module.exports = router

