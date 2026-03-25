const mongoose = require('mongoose');

const collegeAssetSchema = mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['HeaderPDF', 'LogoPNG'] },
    filePath: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CollegeAsset', collegeAssetSchema);
