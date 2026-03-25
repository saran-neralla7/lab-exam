const Template = require('../models/Template');

const createTemplate = async (req, res) => {
  try {
    const { name, type, contentHtml, mappedVariables } = req.body;
    
    let pdfPath = '';
    if (type === 'pdf') {
      if (!req.file) return res.status(400).json({ message: 'PDF file is required for PDF type templates' });
      pdfPath = `uploads/${req.file.filename}`;
    }

    const template = await Template.create({
      name,
      type,
      contentHtml: type === 'html' ? contentHtml : undefined,
      pdfPath: type === 'pdf' ? pdfPath : undefined,
      mappedVariables: type === 'pdf' && mappedVariables ? JSON.parse(mappedVariables) : undefined
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({}).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createTemplate, getTemplates, getTemplateById, deleteTemplate };
