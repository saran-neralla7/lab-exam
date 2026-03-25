const mongoose = require('mongoose');

const sectionSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Section', sectionSchema);
