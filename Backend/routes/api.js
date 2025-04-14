const express = require('express');
const router = express.Router();

// All API routes
router.use('/auth', require('./auth'));

module.exports = router;