const router = require('express').Router();
const { getAuditLogs, getAuditStats, rollbackAction } = require('../controllers/auditController');
const auth = require('../middleware/auth');

router.get('/logs', auth, getAuditLogs);
router.get('/stats', auth, getAuditStats);
router.post('/rollback/:id', auth, rollbackAction);

module.exports = router;
