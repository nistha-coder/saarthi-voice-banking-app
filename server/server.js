
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const path = require('path');

// routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const faqRoutes = require('./routes/faqRoutes');
const botRoutes = require('./routes/botRoutes');


// middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/bot', botRoutes);
const ttsRoutes = require('./routes/ttsRoutes');
app.use('/api/tts', ttsRoutes);



// expose vapid public key (so client can subscribe)
app.get('/api/vapidPublicKey', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
});

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));





// error handler last
app.use(errorHandler);

// start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
