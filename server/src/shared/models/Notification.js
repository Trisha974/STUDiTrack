const pool = require('../config/database')

class Notification {
  static async create(data) {
    const {
      user_id,
      user_type,
      type,
      title,
      message,
      course_id = null,
      grade_id = null,
      attendance_id = null,
      enrollment_id = null
    } = data

    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, user_type, type, title, message, course_id, grade_id, attendance_id, enrollment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, user_type, type, title, message, course_id, grade_id, attendance_id, enrollment_id]
    )
    return this.findById(result.insertId)
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    )
    return rows[0] || null
  }

  static async findByUserId(userId, userType, filters = {}) {
    let query = 'SELECT * FROM notifications WHERE user_id = ? AND user_type = ?'
    const params = [userId, userType]

    if (filters.read !== undefined) {
      query += ' AND `read` = ?'
      params.push(filters.read ? 1 : 0)
    }

    if (filters.type) {
      query += ' AND type = ?'
      params.push(filters.type)
    }

    query += ' ORDER BY created_at DESC'

    if (filters.limit) {
      query += ' LIMIT ?'
      params.push(filters.limit)
    }

    const [rows] = await pool.execute(query, params)
    return rows
  }

  static async getUnreadCount(userId, userType) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND user_type = ? AND `read` = 0',
      [userId, userType]
    )
    return rows[0].count || 0
  }

  static async markAsRead(id) {
    await pool.execute(
      'UPDATE notifications SET `read` = 1 WHERE id = ?',
      [id]
    )
    return this.findById(id)
  }

  static async markAllAsRead(userId, userType) {
    await pool.execute(
      'UPDATE notifications SET `read` = 1 WHERE user_id = ? AND user_type = ? AND `read` = 0',
      [userId, userType]
    )
    return this.findByUserId(userId, userType)
  }

  static async delete(id) {
    await pool.execute(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    )
    return true
  }

  static async deleteByUserId(userId, userType) {
    await pool.execute(
      'DELETE FROM notifications WHERE user_id = ? AND user_type = ?',
      [userId, userType]
    )
    return true
  }
}

module.exports = Notification

