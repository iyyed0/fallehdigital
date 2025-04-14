const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authenticate = require('../middlewares/authMiddleware');

// Protected routes
router.get('/', authenticate, jobController.getAllJobOffers);
router.post('/', authenticate, jobController.createJobOffer);
router.post('/:id/apply', authenticate, jobController.applyForJob);
router.get('/:id/applications', authenticate, jobController.getJobApplications);

module.exports = router;