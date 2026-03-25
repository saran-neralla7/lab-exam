const express = require('express');
const router = express.Router();
const { uploadAsset, getAssets } = require('../controllers/assetController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getAssets);

// Upload routes
router.post('/header', protect, admin, upload.single('header'), uploadAsset);
router.post('/logo', protect, admin, upload.single('logo'), uploadAsset);

module.exports = router;
