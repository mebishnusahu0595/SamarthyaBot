const router = require('express').Router();
const { sendMessage, getConversations, getConversation, deleteConversation, togglePin } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/message', auth, sendMessage);
router.get('/conversations', auth, getConversations);
router.get('/conversations/:id', auth, getConversation);
router.delete('/conversations/:id', auth, deleteConversation);
router.patch('/conversations/:id/pin', auth, togglePin);

module.exports = router;
