
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');

// Configure multer for memory storage (audio files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});


router.post('/signup', upload.array('audio_sample', 5), authController.signup);


router.post('/login', upload.single('audio'), authController.login);



module.exports = router;