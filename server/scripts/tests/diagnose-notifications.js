/**
 * Diagnostic script to check why notifications aren't showing for students
 * 
 * Usage: node scripts/tests/diagnose-notifications.js [student_email_or_firebase_uid]
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const pool = require('../../src/shared/config/database')
const Student = require('../../src/student/models/Student')
const Notification = require('../../src/shared/models/Notification')

async function diagnoseNotifications(studentIdentifier = null) {
  try {
    console.log('🔍 DIAGNOSTIC: Checking notification system...\n')

    // 1. Check if notifications table exists and has data
    console.log('1️⃣ Checking notifications table...')
    const [allNotifications] = await pool.execute('SELECT COUNT(*) as count FROM notifications')
    console.log(`   Total notifications in database: ${allNotifications[0].count}`)

    if (allNotifications[0].count === 0) {
      console.log('   ⚠️  No notifications exist in database!')
      console.log('   💡 This means notifications are not being created when grades/attendance are saved.')
      return
    }

    // 2. Check user_types in notifications
    const [typeRows] = await pool.execute(
      'SELECT user_type, COUNT(*) as count FROM notifications GROUP BY user_type'
    )
    console.log('\n2️⃣ User types in notifications:')
    typeRows.forEach(row => {
      console.log(`   ${row.user_type}: ${row.count} notifications`)
    })

    // 3. Check student notifications
    const [studentNotifs] = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE UPPER(user_type) = 'STUDENT'"
    )
    console.log(`\n   Student notifications (case-insensitive): ${studentNotifs[0].count}`)

    // 4. If student identifier provided, check that specific student
    if (studentIdentifier) {
      console.log(`\n3️⃣ Checking student: ${studentIdentifier}`)
      
      let student = null
      
      // Try Firebase UID
      if (studentIdentifier.length > 20) {
        student = await Student.findByFirebaseUid(studentIdentifier)
        if (student) {
          console.log(`   ✅ Found by Firebase UID: ${student.name} (MySQL ID: ${student.id})`)
        }
      }
      
      // Try email
      if (!student && studentIdentifier.includes('@')) {
        student = await Student.findByEmail(studentIdentifier)
        if (student) {
          console.log(`   ✅ Found by email: ${student.name} (MySQL ID: ${student.id})`)
        }
      }
      
      // Try student ID
      if (!student) {
        student = await Student.findByStudentId(studentIdentifier)
        if (student) {
          console.log(`   ✅ Found by student ID: ${student.name} (MySQL ID: ${student.id})`)
        }
      }

      if (!student) {
        console.log(`   ❌ Student not found with identifier: ${studentIdentifier}`)
        return
      }

      const studentMySQLId = student.id
      console.log(`\n4️⃣ Checking notifications for student MySQL ID: ${studentMySQLId}`)

      // Check with exact match
      const [exactMatch] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND user_type = ?',
        [studentMySQLId, 'Student']
      )
      console.log(`   Exact match (user_type = 'Student'): ${exactMatch[0].count} notifications`)

      // Check with case-insensitive
      const [caseInsensitive] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND UPPER(user_type) = UPPER(?)',
        [studentMySQLId, 'Student']
      )
      console.log(`   Case-insensitive match: ${caseInsensitive[0].count} notifications`)

      // Check without user_type filter
      const [noTypeFilter] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
        [studentMySQLId]
      )
      console.log(`   Without user_type filter: ${noTypeFilter[0].count} notifications`)

      // Show sample notifications
      if (noTypeFilter[0].count > 0) {
        const [sampleNotifs] = await pool.execute(
          'SELECT id, user_id, user_type, title, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
          [studentMySQLId]
        )
        console.log(`\n5️⃣ Sample notifications for this student:`)
        sampleNotifs.forEach(notif => {
          console.log(`   - ID: ${notif.id}, user_type: "${notif.user_type}", title: "${notif.title}", created: ${notif.created_at}`)
        })

        // Check what findByUser returns
        console.log(`\n6️⃣ Testing Notification.findByUser(${studentMySQLId}, 'Student')...`)
        const notifications = await Notification.findByUser(studentMySQLId, 'Student', { limit: 10 })
        console.log(`   Returned ${notifications.length} notifications`)
        if (notifications.length > 0) {
          console.log(`   First notification:`, {
            id: notifications[0].id,
            user_id: notifications[0].user_id,
            user_type: notifications[0].user_type,
            title: notifications[0].title
          })
        }
      } else {
        console.log(`\n   ⚠️  No notifications found for this student!`)
        console.log(`   💡 Check if notifications are being created when grades/attendance are saved.`)
      }
    } else {
      // Show sample of all student notifications
      console.log(`\n3️⃣ Sample student notifications (first 10):`)
      const [samples] = await pool.execute(
        "SELECT id, user_id, user_type, title, created_at FROM notifications WHERE UPPER(user_type) = 'STUDENT' ORDER BY created_at DESC LIMIT 10"
      )
      if (samples.length === 0) {
        console.log('   ⚠️  No student notifications found!')
      } else {
        samples.forEach(notif => {
          console.log(`   - ID: ${notif.id}, user_id: ${notif.user_id}, user_type: "${notif.user_type}", title: "${notif.title}"`)
        })
      }
    }

    console.log('\n✅ Diagnostic complete!')
  } catch (error) {
    console.error('❌ Error running diagnostic:', error)
    console.error('Error details:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    })
  } finally {
    await pool.end()
  }
}

// Run diagnostic
const studentIdentifier = process.argv[2] || null
diagnoseNotifications(studentIdentifier)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

