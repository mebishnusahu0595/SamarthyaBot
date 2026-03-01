const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// WhatsApp Webhook Verification (Meta sends GET request)
router.get('/webhook', whatsappController.verifyWebhook);

// WhatsApp Incoming Messages (Meta sends POST request)
router.post('/webhook', whatsappController.handleMessage);

module.exports = router;
