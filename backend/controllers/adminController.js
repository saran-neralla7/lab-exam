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
    const { name, shortName } = req.body;
    const dept = await Department.create({ name, shortName: shortName || undefined });
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
      .sort({ year: 1, semester: 1, rollNumber: 1 });
    res.json(students);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createStudent = async (req, res) => {
  try {
    const { rollNumber, name, departmentId, sectionId, year, semester } = req.body;
    const student = await Student.create({ rollNumber, name, department: departmentId, section: sectionId, year, semester });
    res.status(201).json(student);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student removed' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const getStudentTemplate = async (req, res) => {
  try {
    const csv = 'rollNumber,name,department,section,year,semester\n21B01A0501,John Doe,CSE,A,2,1\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_template.csv');
    res.send(csv);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const bulkImportStudents = async (req, res) => {
  try {
    const { csvData } = req.body;
    if (!csvData) return res.status(400).json({ message: 'No CSV data provided' });

    const lines = csvData.split('\n').filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ message: 'CSV must have a header and at least one data row' });

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['rollnumber', 'name', 'department', 'year', 'semester'];
    for (const rh of requiredHeaders) {
      if (!headers.includes(rh)) return res.status(400).json({ message: `Missing required column: ${rh}` });
    }

    const departments = await Department.find({});
    const sections = await Section.find({});
    const deptMap = {};
    departments.forEach(d => {
      deptMap[d.name.toLowerCase()] = d._id;
      if (d.shortName) deptMap[d.shortName.toLowerCase()] = d._id;
    });
    const secMap = {};
    sections.forEach(s => { secMap[`${s.department.toString()}_${s.name.toLowerCase()}`] = s._id; });

    let created = 0, skipped = 0, errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      const deptId = deptMap[row.department?.toLowerCase()];
      if (!deptId) { errors.push(`Row ${i + 1}: Department '${row.department}' not found`); skipped++; continue; }

      let secId = null;
      if (row.section) {
        secId = secMap[`${deptId.toString()}_${row.section.toLowerCase()}`];
        if (!secId) { errors.push(`Row ${i + 1}: Section '${row.section}' not found in department '${row.department}'`); skipped++; continue; }
      }

      const yearNum = parseInt(row.year);
      const semNum = parseInt(row.semester);
      if (!yearNum || yearNum < 1 || yearNum > 4) { errors.push(`Row ${i + 1}: Invalid year '${row.year}'`); skipped++; continue; }
      if (!semNum || semNum < 1 || semNum > 2) { errors.push(`Row ${i + 1}: Invalid semester '${row.semester}'`); skipped++; continue; }

      try {
        await Student.create({
          rollNumber: row.rollnumber,
          name: row.name,
          department: deptId,
          section: secId,
          year: yearNum,
          semester: semNum
        });
        created++;
      } catch (err) {
        if (err.code === 11000) { errors.push(`Row ${i + 1}: Duplicate roll number '${row.rollnumber}'`); skipped++; }
        else { errors.push(`Row ${i + 1}: ${err.message}`); skipped++; }
      }
    }

    res.json({ created, skipped, errors });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const exportStudents = async (req, res) => {
  try {
    const students = await Student.find({})
      .populate('department', 'name')
      .populate('section', 'name')
      .sort({ year: 1, semester: 1, rollNumber: 1 });

    let csv = 'rollNumber,name,department,section,year,semester\n';
    students.forEach(s => {
      csv += `${s.rollNumber},${s.name},${s.department?.name || ''},${s.section?.name || ''},${s.year},${s.semester}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students_export.csv');
    res.send(csv);
  } catch (error) { res.status(500).json({ message: error.message }); }
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
  getStudentTemplate, bulkImportStudents, exportStudents,
  getLabs, createLab, deleteLab
};
