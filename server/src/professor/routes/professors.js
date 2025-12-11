const express = require('express')
const router = express.Router()
const {
  getAllProfessors,
  getProfessorById,
  getProfessorByFirebaseUid,
  getProfessorByEmail,
  createProfessor,
  updateProfessor,
  deleteProfessor
} = require('../controllers/professorsController')
const { verifyToken, verifyTokenOnly } = require('../../shared/middleware/auth')
const { validateProfessor } = require('../../shared/middleware/validation')

router.post('/', verifyTokenOnly, validateProfessor, createProfessor)

router.use(verifyToken)

router.get('/', getAllProfessors)

router.get('/firebase/:uid', getProfessorByFirebaseUid)

router.get('/email/:email', getProfessorByEmail)

router.get('/:id', getProfessorById)

router.put('/:id', validateProfessor, updateProfessor)

router.delete('/:id', deleteProfessor)

module.exports = router

