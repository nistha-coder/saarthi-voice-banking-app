

const express = require("express");
const router = express.Router();
const { speak } = require("../controllers/ttsController");  // FIXED

router.post("/speak", speak);  // FIXED

module.exports = router;
