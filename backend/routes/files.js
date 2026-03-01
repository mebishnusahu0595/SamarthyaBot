const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fileController = require('../controllers/fileController');

router.get('/list', auth, fileController.listFiles);
router.get('/read', auth, fileController.readFile);
router.get('/download', auth, fileController.downloadFile);
router.get('/stats', auth, fileController.getStats);
router.post('/mkdir', auth, fileController.createFolder);
router.post('/upload', auth, fileController.uploadFile);
router.delete('/delete', auth, fileController.deleteFile);

module.exports = router;
