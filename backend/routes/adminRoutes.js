const express = require('express');
const router = express.Router();
const {
  getDepartments, createDepartment, deleteDepartment,
  getFaculty, createFaculty, deleteFaculty,
  getSections, createSection, deleteSection,
  getStudents, createStudent, deleteStudent,
  getLabs, createLab, deleteLab
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin); // Secure all admin routes

// Departments
router.route('/departments').get(getDepartments).post(createDepartment);
router.route('/departments/:id').delete(deleteDepartment);

// Faculty
router.route('/faculty').get(getFaculty).post(createFaculty);
router.route('/faculty/:id').delete(deleteFaculty);

// Sections
router.route('/sections').get(getSections).post(createSection);
router.route('/sections/:id').delete(deleteSection);

// Students
router.route('/students').get(getStudents).post(createStudent);
router.route('/students/:id').delete(deleteStudent);

// Labs
router.route('/labs').get(getLabs).post(createLab);
router.route('/labs/:id').delete(deleteLab);

module.exports = router;
