const Notification = require('../models/Notification')
const Student = require('../../student/models/Student')
const Professor = require('../../professor/models/Professor')
const { getUserRoleFromDB } = require('../middleware/auth')

/**
 * Get all notifications for the authenticated user
 */
const getNotifications = async (req, res, next) => {
  try {
    console.log(`\n🚀 [NOTIFICATIONS] ========================================`)
    console.log(`🚀 [NOTIFICATIONS] GET /notifications endpoint called`)
    console.log(`🚀 [NOTIFICATIONS] Request path: ${req.path}`)
    console.log(`🚀 [NOTIFICATIONS] Request query:`, req.query)
    console.log(`🚀 [NOTIFICATIONS] ========================================`)
    
    const userId = req.user.uid
    const userEmail = req.user.email
    const userRole = req.user.role
    
    console.log(`🚀 [NOTIFICATIONS] User from req.user:`, {
      uid: userId,
      email: userEmail,
      role: userRole,
      roleType: typeof userRole,
      hasRole: !!userRole
    })
    
    if (!userRole) {
      console.error(`❌ [NOTIFICATIONS] CRITICAL: req.user.role is undefined!`)
      console.error(`❌ [NOTIFICATIONS] req.user object:`, req.user)
      console.error(`❌ [NOTIFICATIONS] This means getUserRoleFromDB failed or returned null`)
      return res.status(500).json({ 
        error: 'User role not found. Please ensure your account is properly registered.',
        debug: {
          uid: userId,
          email: userEmail,
          role: userRole
        }
      })
    }

    let userMySQLId = null
    let userType = null

    if (userRole === 'Student' && req.query.student_id) {
      const providedStudentId = parseInt(req.query.student_id, 10)
      if (!isNaN(providedStudentId)) {
        console.log(`🔧 [NOTIFICATIONS] WORKAROUND: Using student_id from query parameter: ${providedStudentId}`)
        const Student = require('../../student/models/Student')
        const student = await Student.findById(providedStudentId)
        if (student) {
          if (student.firebase_uid === userId) {
            console.log(`✅ [NOTIFICATIONS] Student ${providedStudentId} verified - Firebase UID matches`)
            userMySQLId = providedStudentId
            userType = 'Student'
          } else {
            console.warn(`⚠️ [NOTIFICATIONS] Student ${providedStudentId} Firebase UID mismatch!`)
            console.warn(`⚠️ [NOTIFICATIONS] Student Firebase UID: ${student.firebase_uid}`)
            console.warn(`⚠️ [NOTIFICATIONS] Logged-in Firebase UID: ${userId}`)
            console.warn(`⚠️ [NOTIFICATIONS] Falling back to Firebase UID lookup...`)
          }
        } else {
          console.warn(`⚠️ [NOTIFICATIONS] Student ${providedStudentId} not found, falling back to Firebase UID lookup...`)
        }
      }
    }

    if (userRole === 'Student' && !userMySQLId) {
      console.log(`\n🔍 [NOTIFICATIONS] ========================================`)
      console.log(`🔍 [NOTIFICATIONS] Starting student lookup...`)
      console.log(`🔍 [NOTIFICATIONS] Firebase UID from token: ${userId}`)
      console.log(`🔍 [NOTIFICATIONS] Email from token: ${userEmail}`)
      console.log(`🔍 [NOTIFICATIONS] Role: ${userRole}`)
      console.log(`🔍 [NOTIFICATIONS] ========================================`)
      
      let student = await Student.findByFirebaseUid(userId)
      if (student) {
        console.log(`✅ [NOTIFICATIONS] Found student by Firebase UID:`)
        console.log(`   MySQL ID: ${student.id} (type: ${typeof student.id})`)
        console.log(`   Name: ${student.name}`)
        console.log(`   Email: ${student.email}`)
        console.log(`   Student ID: ${student.student_id}`)
        console.log(`   Firebase UID: ${student.firebase_uid}`)
      } else {
        console.log(`❌ [NOTIFICATIONS] Student NOT found by Firebase UID: ${userId}`)
      }
      
      if (!student && userEmail) {
        student = await Student.findByEmail(userEmail)
        console.log(`📧 [NOTIFICATIONS] Lookup by email ${userEmail}:`, student ? `✅ Found (MySQL ID: ${student.id}, Name: ${student.name})` : '❌ Not found')
      }
      
      if (!student && userEmail) {
        const emailMatch = userEmail.match(/\.(\d+)\.tc@umindanao\.edu\.ph/)
        if (emailMatch && emailMatch[1]) {
          const extractedStudentId = emailMatch[1]
          student = await Student.findByStudentId(extractedStudentId)
          console.log(`🔍 [NOTIFICATIONS] Lookup by extracted ID ${extractedStudentId}:`, student ? `✅ Found (MySQL ID: ${student.id}, Name: ${student.name})` : '❌ Not found')
        }
      }
      
      if (!student) {
        console.error(`❌ [NOTIFICATIONS] Student profile not found for:`, {
          firebaseUid: userId,
          email: userEmail,
          role: userRole
        })
        console.warn('⚠️ [NOTIFICATIONS] Returning empty array because student profile not found')
        return res.json([])
      }
      userMySQLId = student.id
      userType = 'Student'
      console.log(`\n📬 [NOTIFICATIONS] ✅ Student resolved!`)
      console.log(`📬 [NOTIFICATIONS] MySQL ID: ${userMySQLId} (type: ${typeof userMySQLId})`)
      console.log(`📬 [NOTIFICATIONS] Name: ${student.name}`)
      console.log(`📬 [NOTIFICATIONS] Email: ${student.email}`)
      console.log(`📬 [NOTIFICATIONS] Student ID: ${student.student_id}`)
      console.log(`📬 [NOTIFICATIONS] Firebase UID: ${student.firebase_uid}`)
      console.log(`📬 [NOTIFICATIONS] Now fetching notifications for MySQL ID: ${userMySQLId}...`)
      
      if (typeof userMySQLId !== 'number') {
        console.error(`❌ Student MySQL ID is not a number! Type: ${typeof userMySQLId}, Value: ${userMySQLId}`)
        console.error('❌ This will cause query to fail. Converting to number...')
        userMySQLId = parseInt(userMySQLId, 10)
        if (isNaN(userMySQLId)) {
          console.error('❌ Failed to convert student ID to number. Returning empty array.')
          return res.json([])
        }
        console.log(`✅ Converted student MySQL ID to number: ${userMySQLId}`)
      }
      
      console.log(`📬 Using userType: "${userType}" (type: ${typeof userType})`)
    } else if (userRole === 'Professor') {
      const professor = await Professor.findByFirebaseUid(userId)
      if (!professor) {
        return res.status(404).json({ error: 'Professor profile not found' })
      }
      userMySQLId = professor.id
      userType = 'Professor'
      console.log(`📬 Loading notifications for professor MySQL ID: ${userMySQLId}`)
    } else {
      return res.status(403).json({ error: 'Invalid user role' })
    }

    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0
    const unreadOnly = req.query.unreadOnly === 'true'

    try {
      const pool = require('../config/database')
      const [debugRows] = await pool.execute(
        'SELECT id, user_id, user_type, title, created_at FROM notifications WHERE user_id = ?',
        [userMySQLId]
      )
      console.log(`🔍 DEBUG: All notifications for user_id ${userMySQLId}:`, debugRows.length, 'notifications')
      if (debugRows.length > 0) {
        console.log(`🔍 DEBUG: Sample notification:`, {
          id: debugRows[0].id,
          user_id: debugRows[0].user_id,
          user_type: debugRows[0].user_type,
          title: debugRows[0].title
        })
      }
      console.log(`🔍 DEBUG: Looking for user_type "${userType}" among ${debugRows.length} total notifications`)
      
      const [typeRows] = await pool.execute(
        'SELECT user_type, COUNT(*) as count FROM notifications WHERE user_id = ? GROUP BY user_type',
        [userMySQLId]
      )
      console.log(`🔍 DEBUG: User types for user_id ${userMySQLId}:`, typeRows)
    } catch (debugError) {
      console.warn('⚠️ Debug query failed (non-critical):', debugError.message)
    }

    console.log(`📬 About to call Notification.findByUser with:`, {
      userMySQLId,
      userMySQLIdType: typeof userMySQLId,
      userType,
      userTypeType: typeof userType,
      limit,
      offset,
      unreadOnly
    })
    
    const notifications = await Notification.findByUser(userMySQLId, userType, {
      limit,
      offset,
      unreadOnly
    })

    console.log(`📬 Found ${notifications.length} notifications for ${userType} ID ${userMySQLId}`)
    console.log(`📬 Notifications is array:`, Array.isArray(notifications))
    console.log(`📬 Notifications type:`, typeof notifications)
    
    if (notifications.length > 0) {
      console.log(`📤 Sending ${notifications.length} notifications to client`)
      console.log(`📤 First notification sample:`, {
        id: notifications[0].id,
        user_id: notifications[0].user_id,
        user_type: notifications[0].user_type,
        title: notifications[0].title?.substring(0, 50),
        read: notifications[0].read
      })
    } else {
      console.warn(`⚠️ No notifications found for ${userType} ID ${userMySQLId}`)
      console.warn(`⚠️ This might be why the student sees no notifications!`)
    }
    
    if (!Array.isArray(notifications)) {
      console.error('❌ Notifications is not an array!', notifications)
      console.error('❌ Notifications type:', typeof notifications)
      console.error('❌ Notifications value:', JSON.stringify(notifications).substring(0, 500))
      return res.json([])
    }
    
    if (notifications.length > 0) {
      console.log(`📬 First notification sample:`, {
        id: notifications[0].id,
        title: notifications[0].title,
        read: notifications[0].read,
        user_id: notifications[0].user_id,
        user_type: notifications[0].user_type
      })
      console.log(`✅ Sending ${notifications.length} notifications to client`)
    } else {
      console.warn(`⚠️ No notifications found for ${userType} ID ${userMySQLId}. Checking if notifications exist for this user_id...`)
      try {
        const pool = require('../config/database')
        const [checkRows] = await pool.execute(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
          [userMySQLId]
        )
        console.log(`🔍 Total notifications for user_id ${userMySQLId} (any type): ${checkRows[0].count}`)
        if (checkRows[0].count > 0) {
          const [typeRows] = await pool.execute(
            'SELECT user_type, COUNT(*) as count FROM notifications WHERE user_id = ? GROUP BY user_type',
            [userMySQLId]
          )
          console.log(`🔍 User types for user_id ${userMySQLId}:`, typeRows)
          
          console.log(`🔄 FALLBACK 1: Trying case-insensitive user_type query for user_id ${userMySQLId}...`)
          try {
            const [caseInsensitiveRows] = await pool.execute(
              'SELECT * FROM notifications WHERE user_id = ? AND UPPER(user_type) = UPPER(?) ORDER BY created_at DESC LIMIT ?',
              [userMySQLId, userType, limit || 50]
            )
            console.log(`🔄 Case-insensitive query found ${caseInsensitiveRows.length} notifications`)
            
            if (caseInsensitiveRows.length > 0) {
              console.log(`✅ Found ${caseInsensitiveRows.length} notifications using case-insensitive query`)
              const normalized = caseInsensitiveRows.map(row => ({
                ...row,
                read: Boolean(row.read === 1 || row.read === true)
              }))
              return res.json(normalized)
            }
          } catch (caseError) {
            console.warn('⚠️ Case-insensitive query failed:', caseError.message)
          }
          
          console.log(`🔄 FALLBACK 2: Querying notifications without user_type filter for user_id ${userMySQLId}...`)
          const [allRows] = await pool.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userMySQLId, limit || 50]
          )
          console.log(`🔄 Fallback query found ${allRows.length} notifications without user_type filter`)
          
          if (allRows.length > 0) {
            console.warn(`⚠️ Returning ${allRows.length} notifications without user_type filter as fallback`)
            console.warn(`⚠️ Expected user_type: "${userType}", Found types:`, typeRows.map(r => `${r.user_type} (${r.count})`).join(', '))
            const normalized = allRows.map(row => ({
              ...row,
              read: Boolean(row.read === 1 || row.read === true)
            }))
            return res.json(normalized)
          } else {
            console.warn(`⚠️ Mismatch detected! Looking for user_type "${userType}" but found:`, typeRows.map(r => `${r.user_type} (${r.count})`).join(', '))
          }
        } else {
          console.warn(`⚠️ No notifications exist in database for user_id ${userMySQLId}`)
        }
      } catch (checkError) {
        console.error('❌ Error checking notification mismatch:', checkError)
        console.error('❌ Error details:', {
          message: checkError.message,
          stack: checkError.stack
        })
      }
    }
    
    console.log(`\n📤 [NOTIFICATIONS] FINAL RESULT:`)
    console.log(`📤 [NOTIFICATIONS] Sending ${notifications.length} notifications to client`)
    console.log(`📤 [NOTIFICATIONS] Student MySQL ID used: ${userMySQLId}`)
    console.log(`📤 [NOTIFICATIONS] User Type: ${userType}`)
    if (notifications.length > 0) {
      console.log(`📤 [NOTIFICATIONS] First notification: "${notifications[0].title}" (ID: ${notifications[0].id})`)
    } else {
      console.warn(`⚠️ [NOTIFICATIONS] WARNING: Returning empty array!`)
      console.warn(`⚠️ [NOTIFICATIONS] This means the student will see no notifications.`)
      console.warn(`⚠️ [NOTIFICATIONS] Check if notifications exist for student MySQL ID: ${userMySQLId}`)
      
      try {
        const pool = require('../config/database')
        const [checkRows] = await pool.execute(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
          [userMySQLId]
        )
        console.warn(`⚠️ [NOTIFICATIONS] Database check: ${checkRows[0].count} total notifications exist for user_id ${userMySQLId}`)
        
        if (checkRows[0].count > 0) {
          const [typeRows] = await pool.execute(
            'SELECT user_type, COUNT(*) as count FROM notifications WHERE user_id = ? GROUP BY user_type',
            [userMySQLId]
          )
          console.warn(`⚠️ [NOTIFICATIONS] Notification types found:`, typeRows.map(r => `${r.user_type}: ${r.count}`).join(', '))
        }
      } catch (checkError) {
        console.error(`❌ [NOTIFICATIONS] Error checking database:`, checkError.message)
      }
    }
    console.log(`📤 [NOTIFICATIONS] Response being sent now...\n`)
    
    if (notifications.length === 0) {
      const debugResponse = {
        notifications: [],
        _debug: {
          studentMySQLId: userMySQLId,
          userType: userType,
          firebaseUid: userId,
          email: userEmail,
          role: userRole,
          message: 'No notifications found. Check backend console logs for details.',
          timestamp: new Date().toISOString()
        }
      }
      console.log(`📤 [NOTIFICATIONS] Sending response with debug info:`, JSON.stringify(debugResponse._debug, null, 2))
      res.json(debugResponse)
    } else {
      res.json(notifications)
    }
  } catch (error) {
    console.error('❌ Error in getNotifications controller:', error)
    console.error('❌ Error details:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sqlCode: error.code,
      errno: error.errno,
      stack: error.stack
    })
    console.warn('⚠️ Returning empty array due to error in getNotifications')
    return res.json([])
  }
}

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.uid
    const userEmail = req.user.email
    const userRole = req.user.role

    let userMySQLId = null
    let userType = null

    if (userRole === 'Student') {
      let student = await Student.findByFirebaseUid(userId)
      
      if (!student && userEmail) {
        student = await Student.findByEmail(userEmail)
      }
      
      if (!student && userEmail) {
        const emailMatch = userEmail.match(/\.(\d+)\.tc@umindanao\.edu\.ph/)
        if (emailMatch && emailMatch[1]) {
          const extractedStudentId = emailMatch[1]
          student = await Student.findByStudentId(extractedStudentId)
        }
      }
      
      if (!student) {
        console.error(`❌ [getUnreadCount] Student profile not found for Firebase UID: ${userId}, Email: ${userEmail}`)
        return res.status(404).json({ error: 'Student profile not found' })
      }
      userMySQLId = student.id
      userType = 'Student'
      console.log(`📬 [getUnreadCount] Using student MySQL ID: ${userMySQLId} (type: ${typeof userMySQLId})`)
    } else if (userRole === 'Professor') {
      const professor = await Professor.findByFirebaseUid(userId)
      if (!professor) {
        return res.status(404).json({ error: 'Professor profile not found' })
      }
      userMySQLId = professor.id
      userType = 'Professor'
    } else {
      return res.status(403).json({ error: 'Invalid user role' })
    }

    const count = await Notification.getUnreadCount(userMySQLId, userType)
    console.log(`📊 [getUnreadCount] Returning count: ${count} for ${userType} ID ${userMySQLId}`)
    res.json({ count })
  } catch (error) {
    next(error)
  }
}

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.markAsRead(req.params.id)
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }
    res.json(notification)
  } catch (error) {
    next(error)
  }
}

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.uid
    const userEmail = req.user.email
    const userRole = req.user.role

    let userMySQLId = null
    let userType = null

    if (userRole === 'Student') {
      let student = await Student.findByFirebaseUid(userId)
      
      if (!student && userEmail) {
        student = await Student.findByEmail(userEmail)
      }
      
      if (!student && userEmail) {
        const emailMatch = userEmail.match(/\.(\d+)\.tc@umindanao\.edu\.ph/)
        if (emailMatch && emailMatch[1]) {
          const extractedStudentId = emailMatch[1]
          student = await Student.findByStudentId(extractedStudentId)
        }
      }
      
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' })
      }
      userMySQLId = student.id
      userType = 'Student'
    } else if (userRole === 'Professor') {
      const professor = await Professor.findByFirebaseUid(userId)
      if (!professor) {
        return res.status(404).json({ error: 'Professor profile not found' })
      }
      userMySQLId = professor.id
      userType = 'Professor'
    } else {
      return res.status(403).json({ error: 'Invalid user role' })
    }

    await Notification.markAllAsRead(userMySQLId, userType)
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.delete(req.params.id)
    res.json({ message: 'Notification deleted successfully' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
}


