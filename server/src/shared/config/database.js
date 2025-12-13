const mysql = require('mysql2/promise')
const path = require('path')

const envPath = path.join(__dirname, '../../.env')
require('dotenv').config({ path: envPath })

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_itrack',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
}

if (!process.env.DB_PASSWORD) {
  console.warn('⚠️ DB_PASSWORD is empty in .env file')
}

const pool = mysql.createPool(dbConfig)

pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL connected successfully')
    console.log(`   Host: ${dbConfig.host}`)
    console.log(`   User: ${dbConfig.user}`)
    console.log(`   Database: ${dbConfig.database}`)
    connection.release()
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message)
    console.error(`   Attempted connection to: ${dbConfig.host} as ${dbConfig.user}`)
    console.error(`   Database: ${dbConfig.database}`)
    console.error(`   .env file path: ${envPath}`)
    console.error('   💡 Check: .env file location, MySQL credentials, and MySQL server status')
  })

module.exports = pool

