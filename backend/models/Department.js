const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    shortName: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
