const mongoose = require('mongoose');

const recordSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    filePath: { type: String, required: true },
    documentType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Record', recordSchema);
