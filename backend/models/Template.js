const mongoose = require('mongoose');

const templateSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['html', 'pdf'], required: true }, 
    contentHtml: { type: String }, // Used if type === 'html'
    pdfPath: { type: String },     // Used if type === 'pdf'
    mappedVariables: [{
      variableName: { type: String },
      x: { type: Number }, // Only for pdf type
      y: { type: Number }, // Only for pdf type
      page: { type: Number } // Only for pdf type
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
