const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/session
router.get('/session', authController.getSession);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/signup
router.post('/signup', authController.signup);

module.exports = router;