const express = require('express')
const router = express.Router()
const {
  getAllStudents,
  getStudentById,
  getStudentByFirebaseUid,
  getStudentByEmail,
  getStudentByNumericalId,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentsController')
const { verifyToken, verifyTokenOnly } = require('../../shared/middleware/auth')
const { validateStudent, validateStudentId } = require('../../shared/middleware/validation')

router.post('/', verifyTokenOnly, validateStudent, createStudent)

router.use(verifyToken)

router.get('/', getAllStudents)

router.get('/firebase/:uid', getStudentByFirebaseUid)

router.get('/email/:email', getStudentByEmail)

router.get('/student-id/:studentId', getStudentByNumericalId)

router.get('/:id', validateStudentId, getStudentById)

router.put('/:id', validateStudentId, validateStudent, updateStudent)

router.delete('/:id', validateStudentId, deleteStudent)

module.exports = router

