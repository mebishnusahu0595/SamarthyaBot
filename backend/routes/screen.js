const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const screenController = require('../controllers/screenController');

// Screen Understanding routes
router.post('/analyze', auth, screenController.analyzeScreen);
router.get('/supported', auth, screenController.getSupportedScreens);

module.exports = router;
