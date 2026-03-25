const express = require('express');
const router = express.Router();
const { createTemplate, getTemplates, getTemplateById, deleteTemplate } = require('../controllers/templateController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getTemplates)
  .post(protect, admin, upload.single('templatePdf'), createTemplate);

router.route('/:id')
  .get(protect, getTemplateById)
  .delete(protect, admin, deleteTemplate);

module.exports = router;
