const express = require('express');
const router = express.Router();
const { generateDocument, downloadAllDocs } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/generate', generateDocument);
router.post('/download-all', downloadAllDocs);

module.exports = router;
