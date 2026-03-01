const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegramController');

// Telegram Incoming Webhook (POST request)
router.post('/webhook', telegramController.handleMessage);

module.exports = router;
