const pool = require('../../shared/config/database')

class Grade {
  static async create(data) {
    const { student_id, course_id, assessment_type, assessment_title, score, max_points, date } = data
    const [result] = await pool.execute(
      `INSERT INTO grades (student_id, course_id, assessment_type, assessment_title, score, max_points, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, course_id, assessment_type, assessment_title, score, max_points, date || null]
    )
    return this.findById(result.insertId)
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM grades WHERE id = ?',
      [id]
    )
    return rows[0] || null
  }

  static async findByStudent(student_id) {
    const [rows] = await pool.execute(
      `SELECT g.*, c.code as course_code, c.name as course_name
       FROM grades g
       JOIN courses c ON g.course_id = c.id
       WHERE g.student_id = ?
       ORDER BY g.date DESC, g.created_at DESC`,
      [student_id]
    )
    return rows
  }

  static async findByCourse(course_id) {
    const [rows] = await pool.execute(
      `SELECT g.*, s.name as student_name, s.student_id as student_number
       FROM grades g
       JOIN students s ON g.student_id = s.id
       WHERE g.course_id = ?
       ORDER BY g.date DESC, g.created_at DESC`,
      [course_id]
    )
    return rows
  }

  static async findByStudentAndCourse(student_id, course_id) {
    const [rows] = await pool.execute(
      `SELECT g.*, c.code as course_code, c.name as course_name
       FROM grades g
       JOIN courses c ON g.course_id = c.id
       WHERE g.student_id = ? AND g.course_id = ?
       ORDER BY g.date DESC, g.created_at DESC`,
      [student_id, course_id]
    )
    return rows
  }

  static async update(id, data) {
    const fields = []
    const values = []

    if (data.assessment_type !== undefined) {
      fields.push('assessment_type = ?')
      values.push(data.assessment_type)
    }
    if (data.assessment_title !== undefined) {
      fields.push('assessment_title = ?')
      values.push(data.assessment_title)
    }
    if (data.score !== undefined) {
      fields.push('score = ?')
      values.push(data.score)
    }
    if (data.max_points !== undefined) {
      fields.push('max_points = ?')
      values.push(data.max_points)
    }
    if (data.date !== undefined) {
      fields.push('date = ?')
      values.push(data.date)
    }

    if (fields.length === 0) return this.findById(id)

    values.push(id)
    await pool.execute(
      `UPDATE grades SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
    return this.findById(id)
  }

  static async delete(id) {
    await pool.execute('DELETE FROM grades WHERE id = ?', [id])
    return true
  }
}

module.exports = Grade

