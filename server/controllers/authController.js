
// server/controllers/authController.js
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const MLApiClient = require('../utils/mlApiClient');
const tmp = require('tmp');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const USERS_FILE = path.join(__dirname, '../data/users.json');
const DEMO_OTP = process.env.DEMO_OTP || '123456';

// -------------------- file helpers --------------------
async function readUsers() {
  try {
    const data = await fsp.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // create file if missing
    await fsp.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

async function writeUsers(users) {
  await fsp.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// -------------------- robust FFmpeg conversion --------------------
async function convertWebmToWav(webmBuffer) {
  return new Promise((resolve, reject) => {
    const inputPath = tmp.tmpNameSync({ postfix: '.webm' });
    const outputPath = tmp.tmpNameSync({ postfix: '.wav' });

    try {
      fs.writeFileSync(inputPath, webmBuffer);
    } catch (err) {
      return reject(new Error('Failed to write temp webm file: ' + err.message));
    }

    // Use explicit input options to force proper decoding (common WebM/Opus)
    ffmpeg()
      .input(inputPath)
      .inputOptions(['-f', 'webm'])
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .format('wav')
      .on('start', (cmdline) => {
        console.log('[FFmpeg] start', cmdline);
      })
      .on('error', (err) => {
        console.error('[FFmpeg] error converting', err);
        // cleanup
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch(_) {}
        reject(err);
      })
      .on('end', () => {
        console.log('[FFmpeg] conversion complete ->', outputPath);
        // cleanup input only; caller will clean output after use
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch(_) {}
        resolve(outputPath);
      })
      .save(outputPath);
  });
}


// -------------------- Signup --------------------
exports.signup = async (req, res) => {
  try {
    const { mobileNumber, otp, userName } = req.body;
    const audioFiles = req.files;  // <-- CORRECT

    console.log("Signup attempt:", mobileNumber, " Files:", audioFiles?.length);

    if (!mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: "Mobile number and OTP are required" });
    }

    if (!audioFiles || audioFiles.length !== 3) {
      return res.status(400).json({ success: false, message: "Exactly 3 audio samples required" });
    }

    if (otp !== DEMO_OTP) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Use 123456 for demo." });
    }

    const users = await readUsers();
    if (users.find(u => u.mobileNumber === mobileNumber)) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const userId = "user_" + Date.now();

    // Convert 3 samples to WAV
    let wavPaths = [];
    try {
      for (const f of audioFiles) {
        const wav = await convertWebmToWav(f.buffer);
        wavPaths.push(wav);
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: "Audio conversion failed" });
    }

    // Enroll in ML model
    let enrollResp;
    try {
      enrollResp = await MLApiClient.enrollVoice(userId, wavPaths);
      console.log("ML ENROLL RESPONSE:", enrollResp);
    } catch (err) {
      return res.status(500).json({ success: false, message: "ML enroll failed" });
    }

    // Cleanup wav files
    wavPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });

    if (!enrollResp || enrollResp.status !== "success") {
      return res.status(500).json({ success: false, message: "Voice enrollment failed" });
    }

    const newUser = {
      mobileNumber,
      user_id: userId,
      userName,
      voiceEnrolled: true,
      isAtmLinked: false,
      isMpinSet: false,
      createdAt: new Date().toISOString(),
      chatHistory: []
    };

    users.push(newUser);
    await writeUsers(users);

    return res.status(201).json({
      success: true,
      message: "Signup successful",
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "Signup failed" });
  }
};

// -------------------- Login --------------------
exports.login = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    // single-file login uses req.file
    const audioFile = req.file;

    console.log('Login attempt for:', mobileNumber);

    if (!mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }
    if (!audioFile) {
      return res.status(400).json({ success: false, message: 'Voice recording is required for verification' });
    }

    if (otp !== DEMO_OTP) {
      return res.status(400).json({ success: false, match: false, message: 'Invalid OTP. Use 123456 for demo.' });
    }

    const users = await readUsers();
    const user = users.find(u => u.mobileNumber === mobileNumber);
    if (!user) {
      console.log('User not found:', mobileNumber);
      return res.status(404).json({ success: false, message: 'User not registered. Please sign up first.' });
    }
    if (!user.voiceEnrolled) {
      return res.status(400).json({ success: false, message: 'Voice not enrolled. Please complete signup.' });
    }

    // Convert uploaded WebM→WAV
    let wavPath;
    try {
      console.log('Converting verification audio to WAV...');
      wavPath = await convertWebmToWav(audioFile.buffer);
    } catch (err) {
      console.error('Conversion failed:', err);
      return res.status(500).json({ success: false, message: 'Audio conversion failed.' });
    }

    // Call ML API verify
    let verificationResp;
    try {
      console.log('Calling ML API verifyVoice:', wavPath);
      verificationResp = await MLApiClient.verifyVoice(user.user_id, wavPath);
      console.log('Verification response:', verificationResp);
    } catch (err) {
      console.error('ML API verify error:', err.message || err);
      try { if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath); } catch(_) {}
      return res.status(500).json({ success: false, message: 'Voice verification failed (ML API).' });
    }

    // cleanup wav
    try { if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath); } catch(_) {}

    if (!verificationResp || verificationResp.authenticated !== true) {
      return res.status(401).json({
        success: true,
        match: false,
        message: verificationResp?.message || "Voice verification failed. It's not matching, please say again."
      });
    }

    // generate token
    const token = jwt.sign({ userId: user.user_id, mobileNumber: user.mobileNumber }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      match: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        mobileNumber: user.mobileNumber,
        userName: user.userName,
        isAtmLinked: user.isAtmLinked,
        isMpinSet: user.isMpinSet
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// -------------------- Check Voice --------------------
exports.checkVoice = async (req, res) => {
  try {
    const { userId } = req.body;
    // Accept either req.file or req.files
    const audioFiles = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);

    console.log('Voice check for user:', userId);

    if (!audioFiles || audioFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Voice recording is required' });
    }
    if (!userId) {
      return res.json({ success: true, authenticated: false, message: 'Unknown user detected. Please say again.' });
    }

    const users = await readUsers();
    const user = users.find(u => u.user_id === userId);
    if (!user) {
      return res.json({ success: true, authenticated: false, message: 'Unknown user detected. Please say again.' });
    }

    // Use the first file for quick check
    let wavPath;
    try {
      wavPath = await convertWebmToWav(audioFiles[0].buffer);
    } catch (err) {
      console.error('convertWebmToWav failed in checkVoice:', err);
      return res.status(500).json({ success: false, authenticated: false, message: 'Audio conversion failed' });
    }

    let verificationResp;
    try {
      verificationResp = await MLApiClient.verifyVoice(userId, wavPath);
    } catch (err) {
      console.error('ML API verify error in checkVoice:', err);
      try { if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath); } catch(_) {}
      return res.status(500).json({ success: false, authenticated: false, message: 'Voice check failed (ML API).' });
    }

    try { if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath); } catch(_) {}

    const authenticated = verificationResp && verificationResp.authenticated === true;

    res.json({
      success: true,
      authenticated,
      message: authenticated ? 'Voice recognized. You can proceed.' : 'Unknown user detected. Please say again.'
    });
  } catch (error) {
    console.error('Check voice error:', error);
    res.status(500).json({ success: false, message: 'Voice check failed. Please try again.' });
  }
};
