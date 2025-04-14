const bcrypt = require('bcryptjs');
const { dbPool } = require('../config/db');

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-strong-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: require('../config/sessionStore') // Configure your session store
};

exports.login = async (req, res) => {
  console.log('Login request received:', req.body);
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Database query
    const [users] = await dbPool.query(
      'SELECT id, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create session
    req.session.user = {
      id: user.id,
      email: user.email
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getSession = (req, res) => {
  if (!req.session.user) {
    return res.json({ 
      isAuthenticated: false,
      user: null 
    });
  }
  res.json({
    isAuthenticated: true,
    user: req.session.user
  });
};

exports.signup = async (req, res) => {
  let connection;
  try {
    const { username, email, password, first_name, last_name, phone } = req.body;

    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required except phone' 
      });
    }

    connection = await dbPool.getConnection();

    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: 'Email or username already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await connection.query(
      `INSERT INTO users 
       (username, email, password, first_name, last_name, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, first_name, last_name, phone || null]
    );

    req.session.user = {
      id: result.insertId,
      email,
      firstName: first_name,
      lastName: last_name,
      phone: phone || null
    };

    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Session error' 
        });
      }

      res.status(201).json({ 
        success: true,
        message: 'User registered successfully!',
        user: req.session.user
      });
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) await connection.release();
  }
};

exports.logout = (req, res) => {
  res.clearCookie('connect.sid', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  req.session.destroy(err => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({
        success: false,
        message: 'Could not log out properly'
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

exports.verifySession = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'No active session'
    });
  }
  
  // Verify session exists in store
  sessionStore.get(req.sessionID, (err, session) => {
    if (err || !session) {
      return res.status(401).json({
        success: false,
        message: 'Session verification failed'
      });
    }
    
    res.json({
      success: true,
      user: req.session.user
    });
  });
};

exports.checkSession = (req, res) => {
  if (!req.session.user) {
    return res.json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: req.session.user
  });
};