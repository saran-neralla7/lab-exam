const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    if (file.fieldname === 'header') {
      cb(null, `header${path.extname(file.originalname)}`);
    } else if (file.fieldname === 'logo') {
      cb(null, `logo${path.extname(file.originalname)}`);
    } else {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
  },
});

function checkFileType(file, cb) {
  if (file.fieldname === 'header') {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    return cb(new Error('Only PDF allowed for header'));
  }
  if (file.fieldname === 'logo') {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') return cb(null, true);
    return cb(new Error('Only PNG/JPEG allowed for logo'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
