const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const auth = require('../middleware/auth');
const ttsController = require('../controllers/ttsController');
/**
 * Voice Assistant Routes
 */
const multer = require("multer");
const upload = multer();

router.post(
  "/verify-voice",
  upload.single("audio_verification"),
  assistantController.verifyVoice
);


router.post('/ask', assistantController.ask);


router.post(
  '/complete-sensitive',
  auth,
  assistantController.completeSensitive
);


router.get('/history', auth, assistantController.getHistory);

module.exports = router;