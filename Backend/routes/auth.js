const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

/**
 * @desc    Register a new farmer/user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array(),
      message: 'Validation failed' 
    });
  }

  const { email, password, firstName, lastName, phone, farmName } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      farmName,
      role: 'farmer'
    });

    // Save user
    await newUser.save();

    // Create session
    req.session.user = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role
    };

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: req.session.user
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * @desc    Authenticate user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create session
    req.session.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    return res.json({
      success: true,
      message: 'Login successful',
      user: req.session.user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

/**
 * @desc    Get current session
 * @route   GET /api/auth/session
 * @access  Public
 */
const getSession = (req, res) => {
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

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Could not log out'
      });
    }
    
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

module.exports = {
  signup,
  login,
  getSession,
  logout
};