require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const admin = require('firebase-admin')

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const hasFirebaseConfig =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL

  if (hasFirebaseConfig) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    })
  }
}

async function testNotificationsEndpoint() {
  try {
    console.log('🧪 Testing notifications endpoint...\n')
    
    // Get student 25's Firebase UID
    const pool = require('../../src/shared/config/database')
    const [students] = await pool.execute(
      'SELECT id, name, email, firebase_uid FROM students WHERE id = 25'
    )
    
    if (students.length === 0) {
      console.log('❌ Student ID 25 not found!')
      await pool.end()
      return
    }
    
    const student = students[0]
    console.log('Student 25:', {
      id: student.id,
      name: student.name,
      email: student.email,
      firebase_uid: student.firebase_uid
    })
    
    if (!student.firebase_uid) {
      console.log('❌ Student 25 has no Firebase UID!')
      await pool.end()
      return
    }
    
    // Create a test token (this won't work without proper Firebase setup, but we can test the lookup)
    console.log('\n🔍 Testing student lookup by Firebase UID:', student.firebase_uid)
    
    const Student = require('../../src/student/models/Student')
    const foundStudent = await Student.findByFirebaseUid(student.firebase_uid)
    
    if (foundStudent) {
      console.log('✅ Student found:', {
        id: foundStudent.id,
        name: foundStudent.name,
        email: foundStudent.email
      })
      
      // Check notifications
      const Notification = require('../../src/shared/models/Notification')
      const notifications = await Notification.findByUser(foundStudent.id, 'Student', { limit: 10 })
      console.log(`\n📬 Notifications for student ${foundStudent.id}: ${notifications.length}`)
      
      if (notifications.length > 0) {
        console.log('Sample notifications:')
        notifications.slice(0, 3).forEach((n, i) => {
          console.log(`  ${i + 1}. "${n.title}" (ID: ${n.id})`)
        })
      } else {
        console.log('⚠️ No notifications found!')
        
        // Check if notifications exist in database
        const [countRows] = await pool.execute(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
          [foundStudent.id]
        )
        console.log(`Database check: ${countRows[0].count} notifications exist for user_id ${foundStudent.id}`)
      }
    } else {
      console.log('❌ Student NOT found by Firebase UID!')
    }
    
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

testNotificationsEndpoint()

