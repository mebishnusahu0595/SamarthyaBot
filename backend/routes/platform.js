const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const platformController = require('../controllers/platformController');

// All platform routes require authentication
router.use(auth);

// Get platform real-time status
router.get('/status', platformController.getPlatformStatus);

// Get background jobs
router.get('/jobs', platformController.getBackgroundJobs);

// Emergency Kill Switch
router.post('/emergency-stop', platformController.emergencyStop);

module.exports = router;
