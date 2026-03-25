const mongoose = require('mongoose');

const labSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    enabled: { type: Boolean, default: true },
    checklists: [{ type: String }], // E.g., ['Attendance sheet', 'Order copy', 'Bills']
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lab', labSchema);
