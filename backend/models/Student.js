const mongoose = require('mongoose');

const studentSchema = mongoose.Schema(
  {
    rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    semester: { type: Number, required: true, min: 1, max: 8 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
