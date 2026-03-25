const express = require('express');
const router = express.Router();
const { getMyLabs, getMySections, getMyStudents } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/labs', getMyLabs);
router.get('/sections', getMySections);
router.get('/students', getMyStudents);

module.exports = router;
