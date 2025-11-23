
const express = require('express');
const router = express.Router();
// const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const {
  getDashboardDetails,
  linkAtm,
  setMpin,
  createUpiId,
  verifyMpin,
  getTransactions,
  updateBalance,      // ✅ ADD THIS LINE
  getProfile
} = require('../controllers/userController');


router.get('/details', auth, getDashboardDetails);


router.get('/transactions', auth, getTransactions);

// POST /api/user/link-atm - Link ATM card
router.post('/link-atm', auth, linkAtm);

// POST /api/user/set-mpin - Set mPIN
router.post('/set-mpin', auth, setMpin);


router.post('/create-upi', auth, createUpiId);

// POST /api/user/verify-mpin - Verify mPIN
router.post('/verify-mpin', auth, verifyMpin);

// GET /api/user/profile - Get user profile
router.get('/profile', auth, getProfile);
router.post("/update-balance", auth,  updateBalance);

module.exports = router;