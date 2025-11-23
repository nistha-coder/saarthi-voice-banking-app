
const express = require('express');
const router = express.Router();
const botController = require('../controllers/botController');


router.post('/ask', botController.getBotResponse);

module.exports = router;