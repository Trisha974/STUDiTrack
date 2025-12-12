/**
 * Test script to simulate a student fetching notifications
 * This tests the exact flow that happens when a student logs in
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const Student = require('../../src/student/models/Student')
const Notification = require('../../src/shared/models/Notification')

// Simulate the getNotifications controller logic
async function testStudentFetchNotifications(firebaseUid, email) {
  try {
    console.log('🧪 Testing student notification fetch...\n')
    console.log(`Firebase UID: ${firebaseUid}`)
    console.log(`Email: ${email}\n`)

    let student = null
    let userMySQLId = null
    let userType = null

    // Step 1: Try Firebase UID
    console.log('1️⃣ Looking up student by Firebase UID...')
    student = await Student.findByFirebaseUid(firebaseUid)
    if (student) {
      console.log(`   ✅ Found: ${student.name} (MySQL ID: ${student.id})`)
    } else {
      console.log(`   ❌ Not found by Firebase UID`)
    }

    // Step 2: Try email
    if (!student && email) {
      console.log('\n2️⃣ Looking up student by email...')
      student = await Student.findByEmail(email)
      if (student) {
        console.log(`   ✅ Found: ${student.name} (MySQL ID: ${student.id})`)
      } else {
        console.log(`   ❌ Not found by email`)
      }
    }

    // Step 3: Try extracting student ID from email
    if (!student && email) {
      console.log('\n3️⃣ Trying to extract student ID from email...')
      const emailMatch = email.match(/\.(\d+)\.tc@umindanao\.edu\.ph/)
      if (emailMatch && emailMatch[1]) {
        const extractedStudentId = emailMatch[1]
        console.log(`   Extracted ID: ${extractedStudentId}`)
        student = await Student.findByStudentId(extractedStudentId)
        if (student) {
          console.log(`   ✅ Found: ${student.name} (MySQL ID: ${student.id})`)
        } else {
          console.log(`   ❌ Not found by extracted ID`)
        }
      }
    }

    if (!student) {
      console.log('\n❌ Student not found! This is why notifications are empty.')
      console.log('💡 Check if the student profile exists in the database.')
      return
    }

    userMySQLId = student.id
    userType = 'Student'

    console.log(`\n4️⃣ Student found! MySQL ID: ${userMySQLId}`)
    console.log(`   Name: ${student.name}`)
    console.log(`   Email: ${student.email}`)
    console.log(`   Student ID: ${student.student_id}`)
    console.log(`   Firebase UID: ${student.firebase_uid}`)

    // Step 4: Fetch notifications
    console.log(`\n5️⃣ Fetching notifications for student MySQL ID: ${userMySQLId}...`)
    const notifications = await Notification.findByUser(userMySQLId, userType, {
      limit: 50,
      offset: 0,
      unreadOnly: false
    })

    console.log(`\n📬 Results:`)
    console.log(`   Found ${notifications.length} notifications`)
    
    if (notifications.length > 0) {
      console.log(`\n   Sample notifications:`)
      notifications.slice(0, 5).forEach((notif, idx) => {
        console.log(`   ${idx + 1}. "${notif.title}" (ID: ${notif.id}, Read: ${notif.read})`)
      })
      console.log(`\n✅ Notifications are being fetched correctly!`)
      console.log(`💡 If student still doesn't see them, check:`)
      console.log(`   1. Frontend API call is working`)
      console.log(`   2. Authentication token is valid`)
      console.log(`   3. Frontend is parsing the response correctly`)
    } else {
      console.log(`\n⚠️  No notifications found for this student!`)
      console.log(`💡 Check if notifications were created with the correct student_id`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    console.error('Error details:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    })
  }
}

// Get Firebase UID and email from command line or use test student
const firebaseUid = process.argv[2] || 'hO63N4i5IQcDEjmWtqU1xtfp3nB3' // Trisha's UID
const email = process.argv[3] || 't.talamillo.141715.tc@umindanao.edu.ph'

testStudentFetchNotifications(firebaseUid, email)
  .then(() => {
    const pool = require('../../src/shared/config/database')
    pool.end()
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    const pool = require('../../src/shared/config/database')
    pool.end()
    process.exit(1)
  })

