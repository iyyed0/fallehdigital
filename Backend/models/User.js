const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/authUtils');

class User {
  static async create({ username, email, password, first_name, last_name, phone_number, role }) {
    const hashedPassword = await hashPassword(password);
    const [result] = await pool.execute(
      `INSERT INTO users 
      (username, email, password, first_name, last_name, phone_number, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, first_name, last_name, phone_number, role]
    );
    return result.insertId;
  }

  static async findByEmail(email, withPassword = false) {
    const [rows] = await pool.execute(
      `SELECT ${withPassword ? '*' : 'id, username, email, first_name, last_name, phone_number, role, created_at'} 
      FROM users WHERE email = ?`,
      [email]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, first_name, last_name, phone_number, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await comparePassword(candidatePassword, hashedPassword);
  }
}

module.exports = User;