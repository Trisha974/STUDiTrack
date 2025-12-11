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

router.get('/', getNotifications)

router.get('/unread/count', getUnreadCount)

router.put('/:id/read', markAsRead)

router.put('/read-all', markAllAsRead)

router.delete('/:id', deleteNotification)

module.exports = router

