const router = require('express').Router();
const { getTools, getToolPacks, getPackTools } = require('../controllers/toolsController');
const auth = require('../middleware/auth');

router.get('/', auth, getTools);
router.get('/packs', auth, getToolPacks);
router.get('/packs/:packId', auth, getPackTools);

module.exports = router;
