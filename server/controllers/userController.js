
const fs = require('fs').promises;
const path = require('path');
const QRCode = require('qrcode');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const REMINDERS_FILE = path.join(__dirname, '../data/reminders.json');

/**
 * Read JSON file helper
 */
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array/object
    return filePath.includes('reminders') ? [] : [];
  }
}

/**
 * Write JSON file helper
 */
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * GET DASHBOARD DETAILS - COMPLETE WITH UPI & REMINDERS
 */
exports.getDashboardDetails = async (req, res) => {
  try {
    const { userId } = req.user;

    console.log('Fetching dashboard details for user:', userId);

    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.user_id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch reminders for this user
    const allReminders = await readJsonFile(REMINDERS_FILE);
    const userReminders = allReminders.filter(r => r.userId === userId);

    // CONDITIONAL DATA BASED ON STATE
    if (!user.isAtmLinked) {
      return res.json({
        success: true,
        user: {
          userId: user.user_id,
          userName: user.userName,
          mobileNumber: user.mobileNumber,
          isAtmLinked: false,
          isMpinSet: user.isMpinSet || false,
          upiId: user.upiId || null,
          qrCodeData: user.qrCodeData || null
        },
        bankDetails: {
          balance: 0,
          fds: [],
          loans: []
        },
        recentTransactions: [],
        reminders: userReminders
      });
    } else {
      return res.json({
        success: true,
        user: {
          userId: user.user_id,
          userName: user.userName,
          mobileNumber: user.mobileNumber,
          isAtmLinked: true,
          isMpinSet: user.isMpinSet || false,
          upiId: user.upiId || null,
          qrCodeData: user.qrCodeData || null
        },
        bankDetails: {
         balance: user.bankDetails?.balance ?? 50000,

          fds: [
            {
              id: 'FD001',
              name: 'Demo Fixed Deposit 1',
              amount: 100000,
              interestRate: 7.5,
              maturityDate: '2025-12-31',
              status: 'active'
            },
            {
              id: 'FD002',
              name: 'Demo Fixed Deposit 2',
              amount: 50000,
              interestRate: 7.0,
              maturityDate: '2025-06-30',
              status: 'active'
            }
          ],
          loans: [
            {
              id: 'LOAN001',
              name: 'Demo Personal Loan',
              amount: 200000,
              outstanding: 150000,
              interestRate: 10.5,
              emi: 5000,
              nextDueDate: '2025-02-05',
              status: 'active'
            }
          ]
        },
        recentTransactions: [
          {
            id: 'txn_001',
            type: 'credit',
            amount: 10000,
            description: 'Salary credited',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: 'txn_002',
            type: 'debit',
            amount: 500,
            description: 'ATM withdrawal',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: 'txn_003',
            type: 'debit',
            amount: 1200,
            description: 'Online shopping',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          }
        ],
        reminders: userReminders
      });
    }

  } catch (error) {
    console.error('Get dashboard details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard details'
    });
  }
};

/**
 * LINK ATM
 */
exports.linkAtm = async (req, res) => {
  try {
    const { userId } = req.user;
    const { cardNumber, expiryDate, cvv } = req.body;

    console.log('Linking ATM for user:', userId);

    if (!cardNumber || !expiryDate || !cvv) {
      return res.status(400).json({
        success: false,
        message: 'All ATM card details are required'
      });
    }

    if (cardNumber.length !== 16) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number. Must be 16 digits.'
      });
    }

    if (!/^\d{3}$/.test(cvv)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CVV. Must be 3 digits.'
      });
    }

    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.user_id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    users[userIndex].isAtmLinked = true;
    users[userIndex].atmDetails = {
      cardNumberMasked: `****${cardNumber.slice(-4)}`,
      expiryDate,
      linkedAt: new Date().toISOString()
    };

    await writeJsonFile(USERS_FILE, users);

    console.log('ATM linked successfully for user:', userId);

    res.json({
      success: true,
      message: 'ATM card linked successfully! You can now set your mPIN.',
      redirectTo: '/set-mpin'
    });

  } catch (error) {
    console.error('Link ATM error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link ATM card'
    });
  }
};

/**
 * SET MPIN
 */
exports.setMpin = async (req, res) => {
  try {
    const { userId } = req.user;
    const { mpin, confirmMpin } = req.body;

    console.log('Setting mPIN for user:', userId);

    if (!mpin || !/^\d{4}$/.test(mpin)) {
      return res.status(400).json({
        success: false,
        message: 'mPIN must be a 4-digit number'
      });
    }

    if (mpin !== confirmMpin) {
      return res.status(400).json({
        success: false,
        message: 'mPIN and confirm mPIN do not match'
      });
    }

    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.user_id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    users[userIndex].mpin = mpin;
    users[userIndex].isMpinSet = true;
    users[userIndex].mpinSetAt = new Date().toISOString();

    await writeJsonFile(USERS_FILE, users);

    console.log('mPIN set successfully for user:', userId);

    // CRITICAL: Redirect to /create-upi instead of /dashboard
    res.json({
      success: true,
      message: 'mPIN set successfully!',
      redirectTo: '/create-upi'
    });

  } catch (error) {
    console.error('Set mPIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set mPIN'
    });
  }
};

/**
 * CREATE UPI ID & GENERATE QR CODE (NEW FEATURE)
 */
exports.createUpiId = async (req, res) => {
  try {
    const { userId } = req.user;
    const { upiId } = req.body;

    console.log('Creating UPI ID for user:', userId, '- UPI ID:', upiId);

    if (!upiId) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required'
      });
    }

    // Validate UPI ID format (alphanumeric + @saarthi)
    if (!upiId.endsWith('@saarthi')) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID must end with @saarthi'
      });
    }

    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.user_id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if UPI ID already exists
    const existingUpi = users.find(u => u.upiId === upiId && u.user_id !== userId);
    if (existingUpi) {
      return res.status(400).json({
        success: false,
        message: 'This UPI ID is already taken. Please choose another.'
      });
    }

    // Generate QR Code
    const upiString = `upi://pay?pa=${upiId}&pn=${users[userIndex].userName}&cu=INR`;
    const qrCodeData = await QRCode.toDataURL(upiString);

    // Save to user
    users[userIndex].upiId = upiId;
    users[userIndex].qrCodeData = qrCodeData;
    users[userIndex].upiCreatedAt = new Date().toISOString();

    await writeJsonFile(USERS_FILE, users);

    console.log('UPI ID created successfully for user:', userId);

    res.json({
      success: true,
      message: 'UPI ID created successfully!',
      upiId,
      qrCodeData,
      redirectTo: '/dashboard'
    });

  } catch (error) {
    console.error('Create UPI ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create UPI ID'
    });
  }
};

/**
 * VERIFY MPIN
 */
exports.verifyMpin = async (req, res) => {
  try {
    const { userId } = req.user;
    const { mpin } = req.body;

    console.log('Verifying mPIN for user:', userId);

    if (!mpin) {
      return res.status(400).json({
        success: false,
        message: 'mPIN is required'
      });
    }

    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.user_id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isMpinSet || !user.mpin) {
      return res.status(400).json({
        success: false,
        message: 'mPIN not set. Please set your mPIN first.'
      });
    }

    if (user.mpin !== mpin) {
      return res.status(401).json({
        success: false,
        verified: false,
        message: 'Incorrect mPIN'
      });
    }

    res.json({
      success: true,
      verified: true,
      message: 'mPIN verified successfully'
    });

  } catch (error) {
    console.error('Verify mPIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify mPIN'
    });
  }
};

/**
 * GET TRANSACTIONS - With filter (week/month)
 * NEW ENDPOINT for transaction history page
 */
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.user;
    const { filter } = req.query; // 'week' or 'month'

    console.log('Fetching transactions for user:', userId, 'Filter:', filter);

    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.user_id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isAtmLinked) {
      return res.json({
        success: true,
        transactions: []
      });
    }

    // Generate demo transactions based on filter
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    let transactions = [];

    if (filter === 'week') {
      // Last week transactions (7 days)
      transactions = [
        {
          id: 'txn_w1',
          type: 'credit',
          amount: 5000,
          description: 'Salary credited',
          date: new Date(now - 1 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_w2',
          type: 'debit',
          amount: 250,
          description: 'Grocery shopping',
          date: new Date(now - 2 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_w3',
          type: 'debit',
          amount: 500,
          description: 'ATM withdrawal',
          date: new Date(now - 3 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_w4',
          type: 'credit',
          amount: 1500,
          description: 'Refund received',
          date: new Date(now - 4 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_w5',
          type: 'debit',
          amount: 1200,
          description: 'Online shopping',
          date: new Date(now - 5 * dayMs).toISOString(),
          status: 'completed'
        }
      ];
    } else {
      // Last month transactions (30 days)
      transactions = [
        {
          id: 'txn_m1',
          type: 'credit',
          amount: 15000,
          description: 'Salary credited',
          date: new Date(now - 1 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m2',
          type: 'debit',
          amount: 2500,
          description: 'Rent payment',
          date: new Date(now - 2 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m3',
          type: 'debit',
          amount: 800,
          description: 'Electricity bill',
          date: new Date(now - 5 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m4',
          type: 'debit',
          amount: 1200,
          description: 'Mobile recharge',
          date: new Date(now - 7 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m5',
          type: 'credit',
          amount: 3000,
          description: 'Freelance payment',
          date: new Date(now - 10 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m6',
          type: 'debit',
          amount: 5000,
          description: 'Shopping mall',
          date: new Date(now - 12 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m7',
          type: 'debit',
          amount: 450,
          description: 'Restaurant',
          date: new Date(now - 15 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m8',
          type: 'credit',
          amount: 2000,
          description: 'Cashback credited',
          date: new Date(now - 18 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m9',
          type: 'debit',
          amount: 3500,
          description: 'Insurance premium',
          date: new Date(now - 20 * dayMs).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn_m10',
          type: 'debit',
          amount: 600,
          description: 'Fuel',
          date: new Date(now - 25 * dayMs).toISOString(),
          status: 'completed'
        }
      ];
    }

    res.json({
      success: true,
      filter,
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.user_id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: {
        userId: user.user_id,
        userName: user.userName,
        mobileNumber: user.mobileNumber,
        voiceEnrolled: user.voiceEnrolled,
        isAtmLinked: user.isAtmLinked || false,
        isMpinSet: user.isMpinSet || false,
        upiId: user.upiId || null,
        createdAt: user.createdAt,
        atmDetails: user.atmDetails || null
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

exports.updateBalance = async (req, res) => {
  try {
    const { newBalance } = req.body;
    const userId = req.user.userId;

    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.user_id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update balance in JSON file
    if (!users[userIndex].bankDetails) {
      users[userIndex].bankDetails = {};
    }

    users[userIndex].bankDetails.balance = newBalance;

    await writeJsonFile(USERS_FILE, users);

    res.json({ success: true, balance: newBalance });
    
  } catch (error) {
    console.error("Update balance error:", error);
    res.status(500).json({ success: false, message: "Balance update failed" });
  }
};

