const router = require('express').Router();
const { register, login, getProfile, updateProfile, demoLogin } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/demo', demoLogin);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
