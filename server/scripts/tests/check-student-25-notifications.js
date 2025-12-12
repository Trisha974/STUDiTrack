require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const pool = require('../../src/shared/config/database')
const Student = require('../../src/student/models/Student')
const Notification = require('../../src/shared/models/Notification')

async function checkStudent25() {
  try {
    console.log('🔍 Checking Student ID 25...\n')
    
    // Get student 25
    const student25 = await Student.findById(25)
    if (!student25) {
      console.log('❌ Student ID 25 not found!')
      return
    }
    
    console.log('Student 25 details:')
    console.log(`  MySQL ID: ${student25.id}`)
    console.log(`  Name: ${student25.name}`)
    console.log(`  Email: ${student25.email}`)
    console.log(`  Student ID: ${student25.student_id}`)
    console.log(`  Firebase UID: ${student25.firebase_uid}`)
    
    // Check notifications
    const [notifs] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = 25 AND UPPER(user_type) = UPPER(?)',
      ['Student']
    )
    console.log(`\nNotifications for student ID 25: ${notifs[0].count}`)
    
    if (notifs[0].count > 0) {
      const notifications = await Notification.findByUser(25, 'Student', { limit: 5 })
      console.log(`\nfindByUser returned: ${notifications.length} notifications`)
      notifications.forEach((n, i) => {
        console.log(`  ${i + 1}. "${n.title}" (ID: ${n.id})`)
      })
    }
    
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    await pool.end()
    process.exit(1)
  }
}

checkStudent25()

