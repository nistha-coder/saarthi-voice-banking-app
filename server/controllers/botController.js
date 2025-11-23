
const axios = require('axios');

// The URL where your Python Flask server is running
// MAKE SURE this port (5001) matches what you wrote in app.py
const PYTHON_API_URL = 'http://127.0.0.1:5001/ask'; 

exports.getBotResponse = async (req, res) => {
    const { message, lang } = req.body;

    // Input Validation
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // 1. Forward the data to the Python Microservice
        const response = await axios.post(PYTHON_API_URL, {
            query: message, // Your Python code expects "query"
            lang: lang || 'en' // Default to English if missing
        });

        // 2. Send the Python response back to React
        // The Python API returns: { answer, confidence, matched_question, original_lang }
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Error communicating with AI Service:", error.message);
        
        // Check if Python server is offline
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                answer: "System: The AI service is currently offline. Please start 'app.py'." 
            });
        }

        res.status(500).json({ 
            answer: "System: Something went wrong while processing your request." 
        });
    }
};