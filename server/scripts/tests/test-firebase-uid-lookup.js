require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const Student = require('../../src/student/models/Student')

async function testLookup() {
  const firebaseUid = '2xqwuYFm94PeBrQ3JWgpusfZee93' // Student 25's UID
  
  console.log(`Testing lookup for Firebase UID: ${firebaseUid}\n`)
  
  const student = await Student.findByFirebaseUid(firebaseUid)
  
  if (student) {
    console.log('✅ Found student:')
    console.log(`  MySQL ID: ${student.id}`)
    console.log(`  Name: ${student.name}`)
    console.log(`  Email: ${student.email}`)
    console.log(`  Student ID: ${student.student_id}`)
    console.log(`  Firebase UID: ${student.firebase_uid}`)
  } else {
    console.log('❌ Student not found!')
  }
  
  const pool = require('../../src/shared/config/database')
  await pool.end()
}

testLookup()

