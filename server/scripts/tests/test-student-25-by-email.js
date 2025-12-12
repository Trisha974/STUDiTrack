require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const Student = require('../../src/student/models/Student')
const Notification = require('../../src/shared/models/Notification')

async function testStudent25ByEmail() {
  const email = 't.talamillo.141714.tc@umindanao.edu.ph' // Student 25's email
  
  console.log(`Testing lookup for email: ${email}\n`)
  
  let student = await Student.findByEmail(email)
  
  if (student) {
    console.log('✅ Found student by email:')
    console.log(`  MySQL ID: ${student.id}`)
    console.log(`  Name: ${student.name}`)
    console.log(`  Email: ${student.email}`)
    console.log(`  Student ID: ${student.student_id}`)
    console.log(`  Firebase UID: ${student.firebase_uid}`)
    
    // Now test fetching notifications
    console.log(`\n📬 Fetching notifications for MySQL ID: ${student.id}...`)
    const notifications = await Notification.findByUser(student.id, 'Student', { limit: 10 })
    console.log(`✅ Found ${notifications.length} notifications`)
    
    if (notifications.length > 0) {
      console.log('\nSample notifications:')
      notifications.slice(0, 3).forEach((n, i) => {
        console.log(`  ${i + 1}. "${n.title}" (ID: ${n.id})`)
      })
    }
  } else {
    console.log('❌ Student not found by email!')
  }
  
  const pool = require('../../src/shared/config/database')
  await pool.end()
}

testStudent25ByEmail()

