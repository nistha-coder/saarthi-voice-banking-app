// ========== server/routes/faqRoutes.js (NEW FILE) ==========
const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');


router.post('/ask', faqController.askFaq);

module.exports = router;