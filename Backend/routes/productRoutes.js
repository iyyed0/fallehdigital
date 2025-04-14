const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middlewares/authMiddleware');

// Protected routes
router.get('/', authenticate, productController.getAllProducts);
router.post('/', authenticate, productController.createProduct);

module.exports = router;