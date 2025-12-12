const express = require('express')
const router = express.Router()
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationsController')
const { verifyToken } = require('../middleware/auth')

router.use(verifyToken)


router.get('/debug', async (req, res) => {
  try {
    const Student = require('../../student/models/Student')
    const userId = req.user.uid
    const userEmail = req.user.email
    
    let student = await Student.findByFirebaseUid(userId)
    if (!student && userEmail) {
      student = await Student.findByEmail(userEmail)
    }
    if (!student && userEmail) {
      const emailMatch = userEmail.match(/\.(\d+)\.tc@umindanao\.edu\.ph/)
      if (emailMatch && emailMatch[1]) {
        student = await Student.findByStudentId(emailMatch[1])
      }
    }
    
    if (student) {
      const pool = require('../config/database')
      const [notifCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND UPPER(user_type) = UPPER(?)',
        [student.id, 'Student']
      )
      
      return res.json({
        resolved: true,
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          student_id: student.student_id,
          firebase_uid: student.firebase_uid
        },
        notificationCount: notifCount[0].count,
        firebaseUidFromToken: userId,
        emailFromToken: userEmail
      })
    } else {
      return res.json({
        resolved: false,
        firebaseUidFromToken: userId,
        emailFromToken: userEmail,
        error: 'Student not found'
      })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

router.get('/', getNotifications)

router.get('/unread/count', getUnreadCount)

router.put('/:id/read', markAsRead)

router.put('/read-all', markAllAsRead)

router.delete('/:id', deleteNotification)

module.exports = router

