// api/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../../Backend/config/db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const [user] = await pool.query(
      'SELECT id, email, password FROM users WHERE email = ?', 
      [email]
    );

    if (user.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Successful login
    res.json({ 
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;