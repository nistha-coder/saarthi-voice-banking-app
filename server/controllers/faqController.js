const axios = require('axios');

/**
 * FAQ Controller
 * Proxies requests to the external FAQ Python server
 * CRITICAL: Translates queryText → query for Python API
 */

const askFaq = async (req, res) => {
  try {
    const { queryText } = req.body; // From React frontend

    if (!queryText) {
      return res.status(400).json({
        success: false,
        answer: 'Please provide a question'
      });
    }

    console.log('FAQ Query:', queryText);

    // Get FAQ API URL from environment
    const faqApiUrl = process.env.FAQ_API_URL || 'http://localhost:5001';

    // CRITICAL TRANSLATION: queryText → query
    const response = await axios.post(`${faqApiUrl}/faq-answer`, {
      question: queryText  // Python server expects "query", not "queryText"
    }, {
      timeout: 10000 // 10 second timeout
    });

    console.log('FAQ Response:', response.data);

    // Send answer back to React
    res.json({
      success: true,
      answer: response.data.answer || 'No answer available',
      confidence: response.data.confidence ?? null
    });

  } catch (error) {
    console.error('Error calling FAQ server:', error.message);
    
    // Friendly error message
    res.status(500).json({
      success: false,
      answer: 'Sorry, I am unable to get an answer right now. Please try again later.'
    });
  }
};

module.exports = { askFaq };
