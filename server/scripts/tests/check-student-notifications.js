require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const pool = require('../../src/shared/config/database')
const Student = require('../../src/student/models/Student')
const Notification = require('../../src/shared/models/Notification')

async function checkStudentNotifications() {
  try {
    // Get first student with notifications
    const [students] = await pool.execute(`
      SELECT DISTINCT s.id, s.name, s.email, s.student_id, s.firebase_uid
      FROM students s
      INNER JOIN notifications n ON n.user_id = s.id
      WHERE UPPER(n.user_type) = 'STUDENT'
      LIMIT 3
    `)

    console.log(`Found ${students.length} students with notifications:\n`)

    for (const student of students) {
      console.log(`Student: ${student.name}`)
      console.log(`  MySQL ID: ${student.id}`)
      console.log(`  Email: ${student.email}`)
      console.log(`  Student ID: ${student.student_id}`)
      console.log(`  Firebase UID: ${student.firebase_uid || 'null'}`)

      // Check notifications using findByUser
      const notifications = await Notification.findByUser(student.id, 'Student', { limit: 5 })
      console.log(`  Notifications found by findByUser: ${notifications.length}`)

      // Check direct query
      const [directNotifs] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND UPPER(user_type) = UPPER(?)',
        [student.id, 'Student']
      )
      console.log(`  Notifications found by direct query: ${directNotifs[0].count}`)

      if (notifications.length > 0) {
        console.log(`  Sample notification: "${notifications[0].title}"`)
      }
      console.log('')
    }

    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    await pool.end()
    process.exit(1)
  }
}

checkStudentNotifications()

