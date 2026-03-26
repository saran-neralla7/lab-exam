const Lab = require('../models/Lab');
const Student = require('../models/Student');
const Section = require('../models/Section');

const getMyLabs = async (req, res) => {
  try {
    const labs = await Lab.find({ department: req.user.department, enabled: true }).sort({ createdAt: -1 });
    res.json(labs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMySections = async (req, res) => {
  try {
    const sections = await Section.find({ department: req.user.department }).sort({ name: 1 });
    res.json(sections);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyStudents = async (req, res) => {
  try {
    const filter = { department: req.user.department };
    if (req.query.sectionId) filter.section = req.query.sectionId;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.year) filter.year = req.query.year;

    const students = await Student.find(filter)
      .populate('section', 'name')
      .sort({ year: 1, semester: 1, rollNumber: 1 });
    res.json(students);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMyLabs, getMySections, getMyStudents };
