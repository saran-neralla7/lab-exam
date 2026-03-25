const CollegeAsset = require('../models/CollegeAsset');

const uploadAsset = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded or wrong file type' });
    }

    const type = file.fieldname === 'header' ? 'HeaderPDF' : 'LogoPNG';
    const filePath = `uploads/${file.filename}`;

    let asset = await CollegeAsset.findOne({ type });
    if (asset) {
      asset.filePath = filePath;
      await asset.save();
    } else {
      asset = await CollegeAsset.create({ type, filePath });
    }

    res.json({ message: `${type} uploaded successfully`, asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssets = async (req, res) => {
  try {
    const assets = await CollegeAsset.find({});
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadAsset, getAssets };
