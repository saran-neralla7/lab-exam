const Department = require('../models/Department');
const Section = require('../models/Section');
const Student = require('../models/Student');
const User = require('../models/User');
const Lab = require('../models/Lab');

// --- DEPARTMENTS ---
const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find({}).sort({ createdAt: -1 });
    res.json(depts);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createDepartment = async (req, res) => {
  try {
    const dept = await Department.create({ name: req.body.name });
    res.status(201).json(dept);
  } catch (error) { res.status(400).json({ message: 'Department may already exist' }); }
};

const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department removed' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- USERS (Faculty) ---
const getFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'Faculty' }).populate('department', 'name');
    res.json(faculty);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createFaculty = async (req, res) => {
  try {
    const { username, password, departmentId } = req.body;
    const user = await User.create({ username, password, role: 'Faculty', department: departmentId });
    res.status(201).json(user);
  } catch (error) { res.status(400).json({ message: 'Error creating user' }); }
};

const deleteFaculty = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- SECTIONS ---
const getSections = async (req, res) => {
  try {
    const sections = await Section.find({}).populate('department', 'name').sort({ createdAt: -1 });
    res.json(sections);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createSection = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    const section = await Section.create({ name, department: departmentId });
    res.status(201).json(section);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section removed' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- STUDENTS ---
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({})
      .populate('department', 'name')
      .populate('section', 'name')
      .sort({ semester: 1, rollNumber: 1 });
    res.json(students);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createStudent = async (req, res) => {
  try {
    const { rollNumber, name, departmentId, sectionId, semester } = req.body;
    const student = await Student.create({ rollNumber, name, department: departmentId, section: sectionId, semester });
    res.status(201).json(student);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student removed' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- LABS ---
const getLabs = async (req, res) => {
  try {
    const labs = await Lab.find({}).populate('department', 'name').sort({ createdAt: -1 });
    res.json(labs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createLab = async (req, res) => {
  try {
    const { name, departmentId, enabled, checklists } = req.body;
    const lab = await Lab.create({ name, department: departmentId, enabled, checklists });
    res.status(201).json(lab);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteLab = async (req, res) => {
  try {
    await Lab.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lab removed' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = {
  getDepartments, createDepartment, deleteDepartment,
  getFaculty, createFaculty, deleteFaculty,
  getSections, createSection, deleteSection,
  getStudents, createStudent, deleteStudent,
  getLabs, createLab, deleteLab
};
