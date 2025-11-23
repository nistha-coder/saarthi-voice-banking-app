
const fs = require('fs').promises;
const path = require('path');
const MLApiClient = require('../utils/mlApiClient');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const REMINDERS_FILE = path.join(__dirname, '../data/reminders.json');
// Sensitive intents that always require MPIN verification
const SENSITIVE_INTENTS = [
  "balance_inquiry",
  "loan_inquiry",
  "fd_withdrawal",
  "fund_transfer",
  "bill_payment",
  "credit_limit_inquiry"
];

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return filePath.includes('reminders') ? [] : [];
  }
}

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * VOICE ASSISTANT - Main Q&A endpoint
 * COMPLETE with ALL 8 intents + set_reminder
 */
exports.ask = async (req, res) => {
  try {
    const { queryText, language, userId } = req.body;

    if (!queryText) {
      return res.status(400).json({
        success: false,
        message: 'Query text is required'
      });
    }

    console.log('Processing query:', queryText, 'for user:', userId);

    // INTEGRATION POINT: Call ML API to predict intent
    let intent = 'unknown';
    let entities = [];
    
    try {
      const mlResponse = await MLApiClient.predictIntent(queryText);
      intent = mlResponse.intent;
      entities = mlResponse.entities || [];
      console.log('ML API response - Intent:', intent, 'Entities:', entities);
    } catch (mlError) {
      console.warn('ML API not available, using rule-based fallback');
      intent = detectIntentFallback(queryText);
    }

    
let response;

// 🔥 First check if this intent always needs MPIN
if (SENSITIVE_INTENTS.includes(intent)) {
  response = {
    type: "requires_mpin",
    textResponse:
      language === "hi"
        ? "कृपया अपने mPIN की पुष्टि करें।"
        : "Please verify your MPIN.",
    requiresMpin: true,
    data: { action: intent, entities }
  };
} else {
  // 🔥 Non-sensitive → normal flow
  switch (intent) {
    case 'transaction_history':
      response = await handleTransactionHistory(language);
      break;

    case 'complaint_registration':
      response = await handleComplaint(language);
      break;

    case 'set_reminder':
      response = await handleSetReminder(userId, entities, language);
      break;

    case 'navigation':
      response = handleNavigation(queryText, language);
      break;

    default:
      response = handleUnknownIntent(queryText, language);
  }
}

    // Save interaction to chat history
    await saveToHistory(userId, queryText, response.textResponse);

    res.json({
      success: true,
      intent,
      entities,
      ...response
    });

  } catch (error) {
    console.error('Assistant ask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process query'
    });
  }
};




exports.faqAsk = async (req, res) => {
  try {
    const { queryText } = req.body;

    if (!queryText) {
      return res.status(400).json({
        success: false,
        message: 'Query text is required'
      });
    }

    try {
      // 🔥 CALL PYTHON ML FAQ MODEL
      const mlResp = await MLApiClient.askFaq(queryText);

      return res.json({
        success: true,
        answer: mlResp.answer,
        confidence: mlResp.confidence
      });

    } catch (err) {
      console.error("FAQ ML error:", err.message);

      return res.json({
        success: false,
        answer: "Sorry, I couldn't find an answer right now.",
      });
    }

  } catch (error) {
    console.error('FAQ ask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process FAQ query'
    });
  }
};


exports.verifyVoice = async (req, res) => {
  try {
    const userId = req.body.user_id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ authenticated: false, message: "No audio provided" });
    }

    const response = await MLApiClient.verifyVoice(userId, file.buffer);

    res.json(response);
  } catch (err) {
    console.error("Voice verify error:", err.message);
    res.json({ authenticated: false, message: "Verification failed" });
  }
};



/**
 * GET CHAT HISTORY
 */
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.user_id === userId);
    
    const history = user?.chatHistory || [];

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
};

// ========== INTENT HANDLERS ==========

async function handleBalanceInquiry(userId, language) {
  const users = await readJsonFile(USERS_FILE);
  const user = users.find(u => u.user_id === userId);
  
  const balance = user?.isAtmLinked ? 50000 : 0;
  
  const textResponse = language === 'hi' 
    ? `आपका खाता शेष ₹${balance} है।`
    : `Your account balance is ₹${balance}.`;
  
  return {
    type: 'data',
    textResponse,
    data: { balance }
  };
}

async function handleTransactionHistory(language) {
  const textResponse = language === 'hi'
    ? 'आपका लेन-देन इतिहास खोल रहा हूँ।'
    : 'Opening your transaction history.';
  
  return {
    type: 'navigation',
    target: '/history',
    textResponse
  };
}

async function handleFundTransfer(entities, language) {
  const person = entities.find(e => e.label === 'B-PERSON')?.text;
  const amount = entities.find(e => e.label === 'B-AMOUNT')?.text;
  
  if (!person || !amount) {
    const textResponse = language === 'hi'
      ? 'कृपया प्राप्तकर्ता का नाम और राशि बताएं।'
      : 'Please provide recipient name and amount.';
    
    return {
      type: 'clarification',
      textResponse
    };
  }
  
  const textResponse = language === 'hi'
    ? `${person} को ₹${amount} भेजने के लिए अपना mPIN दर्ज करें।`
    : `Enter your mPIN to send ₹${amount} to ${person}.`;
  
  return {
    type: 'action',
    action: 'transfer',
    requiresMpin: true,
    textResponse,
    data: { recipient: person, amount }
  };
}

async function handleBillPayment(entities, language) {
  const billType = entities.find(e => e.label.includes('BILL_TYPE'))?.text;
  const amount = entities.find(e => e.label === 'B-AMOUNT')?.text;
  
  const textResponse = language === 'hi'
    ? `बिल भुगतान के लिए तैयार करना: ${billType || 'बिल'} ${amount ? `₹${amount}` : ''}`
    : `Preparing bill payment for: ${billType || 'bill'} ${amount ? `₹${amount}` : ''}`;
  
  return {
    type: 'action',
    action: 'bill_payment',
    requiresMpin: true,
    textResponse,
    data: { billType, amount }
  };
}

async function handleLoanInquiry(userId, language) {
  const users = await readJsonFile(USERS_FILE);
  const user = users.find(u => u.user_id === userId);
  
  const loans = user?.isAtmLinked ? [
    { type: 'Personal Loan', amount: 200000, outstanding: 150000 }
  ] : [];
  
  let textResponse;
  if (loans.length === 0) {
    textResponse = language === 'hi'
      ? 'आपके पास कोई सक्रिय ऋण नहीं है।'
      : 'You have no active loans.';
  } else {
    const loanInfo = loans.map(l => `${l.type}: ₹${l.outstanding} outstanding`).join(', ');
    textResponse = language === 'hi'
      ? `आपके ऋण: ${loanInfo}`
      : `Your loans: ${loanInfo}`;
  }
  
  return {
    type: 'data',
    textResponse,
    data: { loans }
  };
}

async function handleFdWithdrawal(language) {
  const textResponse = language === 'hi'
    ? 'FD निकासी के लिए अपना mPIN दर्ज करें।'
    : 'Enter your mPIN for FD withdrawal.';
  
  return {
    type: 'action',
    action: 'fd_withdrawal',
    requiresMpin: true,
    textResponse
  };
}

async function handleComplaint(language) {
  const textResponse = language === 'hi'
    ? 'कृपया अपनी शिकायत बताएं, मैं इसे दर्ज कर लूंगा।'
    : 'Please describe your complaint, I will register it.';
  
  return {
    type: 'clarification',
    textResponse
  };
}

async function handleCreditLimitInquiry(language) {
  const textResponse = language === 'hi'
    ? 'आपकी क्रेडिट सीमा ₹50,000 है।'
    : 'Your credit limit is ₹50,000.';
  
  return {
    type: 'data',
    textResponse,
    data: { creditLimit: 50000 }
  };
}

/**
 * NEW: Handle Set Reminder Intent
 */
async function handleSetReminder(userId, entities, language) {
  try {
    const billType = entities.find(e => e.label.includes('BILL_TYPE'))?.text || 'payment';
    const dateText = entities.find(e => e.label.includes('DATE'))?.text || 'soon';
    
    // Read existing reminders
    const reminders = await readJsonFile(REMINDERS_FILE);
    
    // Create new reminder
    const newReminder = {
      id: `reminder_${Date.now()}`,
      userId,
      billType,
      dateText,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    reminders.push(newReminder);
    await writeJsonFile(REMINDERS_FILE, reminders);
    
    const textResponse = language === 'hi'
      ? `ठीक है, मैं आपको ${billType} का भुगतान ${dateText} करने की याद दिला दूंगा।`
      : `Okay, I will remind you to pay ${billType} ${dateText}.`;
    
    return {
      type: 'success',
      textResponse,
      data: { reminder: newReminder }
    };
  } catch (error) {
    console.error('Error setting reminder:', error);
    const textResponse = language === 'hi'
      ? 'रिमाइंडर सेट करने में त्रुटि हुई।'
      : 'Error setting reminder.';
    
    return {
      type: 'error',
      textResponse
    };
  }
}

function handleNavigation(query, language) {
  const lowerQuery = query.toLowerCase();
  
  let target = '/dashboard';
  let textResponse = 'Opening...';
  
  if (lowerQuery.includes('history') || lowerQuery.includes('इतिहास')) {
    target = '/history';
    textResponse = language === 'hi' ? 'इतिहास खोल रहा हूँ' : 'Opening history';
  } else if (lowerQuery.includes('profile') || lowerQuery.includes('प्रोफ़ाइल')) {
    target = '/profile';
    textResponse = language === 'hi' ? 'प्रोफ़ाइल खोल रहा हूँ' : 'Opening profile';
  } else if (lowerQuery.includes('faq') || lowerQuery.includes('help')) {
    target = '/faq';
    textResponse = language === 'hi' ? 'FAQ खोल रहा हूँ' : 'Opening FAQ';
  }
  
  return {
    type: 'navigation',
    target,
    textResponse
  };
}

function handleUnknownIntent(query, language) {
  const textResponse = language === 'hi'
    ? 'मैं समझ नहीं पाया। कृपया फिर से कहें।'
    : 'I didn\'t understand that. Please say again.';
  
  return {
    type: 'unknown',
    textResponse
  };
}

function detectIntentFallback(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('balance') || lowerQuery.includes('शेष')) return 'balance_inquiry';
  if (lowerQuery.includes('history') || lowerQuery.includes('इतिहास')) return 'navigation';
  if (lowerQuery.includes('transfer') || lowerQuery.includes('send') || lowerQuery.includes('भेज')) return 'fund_transfer';
  if (lowerQuery.includes('bill') || lowerQuery.includes('बिल')) return 'bill_payment';
  if (lowerQuery.includes('loan') || lowerQuery.includes('ऋण')) return 'loan_inquiry';
  if (lowerQuery.includes('fd') || lowerQuery.includes('fixed')) return 'fd_withdrawal';
  if (lowerQuery.includes('complaint') || lowerQuery.includes('शिकायत')) return 'complaint_registration';
  if (lowerQuery.includes('credit') || lowerQuery.includes('limit')) return 'credit_limit_inquiry';
  if (lowerQuery.includes('remind') || lowerQuery.includes('याद')) return 'set_reminder';
  
  return 'unknown';
}

async function saveToHistory(userId, query, response) {
  try {
    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.user_id === userId);
    
    if (userIndex !== -1) {
      if (!users[userIndex].chatHistory) {
        users[userIndex].chatHistory = [];
      }
      
      users[userIndex].chatHistory.push({
        timestamp: new Date().toISOString(),
        query,
        response
      });
      
      if (users[userIndex].chatHistory.length > 50) {
        users[userIndex].chatHistory = users[userIndex].chatHistory.slice(-50);
      }
      
      await writeJsonFile(USERS_FILE, users);
    }
  } catch (error) {
    console.error('Save to history error:', error);
  }
}









exports.completeSensitive = async (req, res) => {
  try {
    const { action, entities } = req.body.data;
    const { mpin } = req.body;
    const { userId } = req.user;

    console.log("Completing sensitive action:", action, "for", userId);

    let textResponse = "";

    switch (action) {
      case "balance_inquiry":
        textResponse = "Your account balance is ₹50,000.";
        break;

      case "loan_inquiry":
        textResponse = "Your outstanding loan amount is ₹1,50,000.";
        break;

      case "fd_withdrawal":
        textResponse = "Your FD withdrawal request has been submitted.";
        break;

      case "bill_payment":
        const bill = entities?.find(e => e.label.includes("BILL_TYPE"))?.text || "your bill";
        textResponse = `Your payment for ${bill} is successful.`;
        break;

      case "fund_transfer":
        const person = entities?.find(e => e.label === "B-PERSON")?.text || "recipient";
        const amount = entities?.find(e => e.label === "B-AMOUNT")?.text || "";
        textResponse = `₹${amount} successfully sent to ${person}.`;
        break;

      case "credit_limit_inquiry":
        textResponse = "Your credit limit is ₹50,000.";
        break;

      default:
        textResponse = "Action completed successfully.";
    }

    return res.json({ textResponse });

  } catch (err) {
    console.error("Complete Sensitive Error:", err);
    return res.status(500).json({ textResponse: "Failed to complete action." });
  }
};
