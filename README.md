# 🌟 Saarthi – Your Intelligent Banking Companion

> **Team Name:** Powerpuff Girls  
> **Members:** Nistha Sarawagi, Veekshitha Nelluru, Sahasra Ambati

---

## 🔗 Quick Links
- **GitHub Repository:** [Paste Link Here]
- **Video Demo:** [Paste Link Here]

---

## 📘 1. Project Overview

**Saarthi** is an inclusive, AI-powered digital banking assistant designed to make banking simple, safe, and accessible for everyone — especially elderly users, rural communities, visually impaired individuals, and those who struggle with traditional banking apps.

Users can perform banking operations through **voice**, **text**, and **prototype-level sign-language support**. The system is built on a Hybrid Microservices Architecture, combining Node.js, React, and Python-based AI engines.

---

## 📘 2. Key Features

### 🔹 Core Banking
* Check account balance
* View recent transactions
* Transfer funds
* Manage fixed deposits
* Pay bills & mobile recharge
* Raise or track complaints

### 🔹 AI Features
* **Voice-based interaction:** Speech-to-Text + Text-to-Speech.
* **Intent Detection:** Powered by Scikit-Learn.
* **Smart FAQ:** RAG-based responses using FAISS.
* **Generative Answers:** Gemini-powered assistance (optional).

### 🔹 Security
* **Authentication:** JWT Authentication.
* **Transaction Security:** mPIN verification for sensitive actions.
* **Voice Biometrics:** Prototype-level authentication using MFCC.
* **Protection:** Rate limiting & brute-force protection.

### 🔹 Accessibility
* **Multilingual UI:** Support for English + Hindi.
* **Visual Aids:** Clean, high-contrast UI.
* **Sign Language:** Prototype support via SignLearn integration.

---

## 🧱 3. Technology Stack

### **Frontend**
* React.js (Vite)
* Context API
* Web Speech API
* Custom CSS

### **Backend**
* Node.js + Express
* JWT Authentication
* mPIN Security
* Mock Banking Database (JSON Files)

### **AI Engine (FAQ + Intent)**
* Python + Flask
* FAISS Vector DB
* Scikit-Learn Intent Classifier
* Sentence Transformers
* Gemini API (optional)

### **ML Service (Voice Biometrics + NER)**
* Python
* Librosa (MFCC Feature Extraction)
* spaCy (NER Model)

---

## 📁 4. Folder Structure

```bash
Saarthi
│── ai_engine/                     # FAQ + Intent AI service (Port 5001)
│── client/                        # React frontend (Port 5173)
│── ml-saarthi/saarthi-ml-api/     # Voice biometrics + NER (Port 5002)
└── server/                        # Node.js backend (Port 3001)

⚙️ 5. Installation & Running the Application
To run Saarthi, you need to start 4 separate services.
Service,Directory,Command,Port
Frontend,client/,npm run dev,5173
Backend,server/,node server.js,3001
FAQ/AI Engine,ai_engine/,python app.py,5001
ML API,ml-saarthi/saarthi-ml-api/,python app.py,5002

✅ Step 1 — Clone the Project
git clone [https://github.com/your-username/saarthi.git](https://github.com/your-username/saarthi.git)
cd saarthi

✅ Step 2 — Run Frontend
cd client
npm install
npm run dev

✅ Step 3 — Run Backend
cd server
npm install
node server.js

✅ Step 4 — Run AI Engine (FAQ + Intent)
cd ai_engine
pip install -r requirements.txt
python app.py

✅ Step 5 — Run ML API (Voice Biometrics + NER)
cd ml-saarthi/saarthi-ml-api
pip install -r requirements.txt
python app.py

🔐 6. Environment Variables Setup
⚠️ Important: You must create your own .env files. Do NOT upload .env files to GitHub.

✔ Backend Env: server/.env
Create a file named .env inside the server folder and add:
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your-jwt-secret-key

# External AI/ML Services
ML_API_URL=http://localhost:5002
FAQ_API_URL=http://localhost:5001

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# OTP for Demo
DEMO_OTP=your-demo-otp

# Sessions
SESSION_SECRET=your-session-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Google Text-to-Speech Credentials
GOOGLE_APPLICATION_CREDENTIALS=./config/google-tts.json
GOOGLE_PROJECT_ID=your-google-project-id

# Push Notifications (optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
EMAIL_FROM=your-email@example.com

✔ FAQ AI Engine Env: ai_engine/.env
Create a file named .env inside the ai_engine folder:
GOOGLE_API_KEY=your-google-or-gemini-api-key

✔ ML Service Env
The ML Service uses a config.cfg file — no .env required

📝 7. How to Use Saarthi
Open your browser and navigate to http://localhost:5173.

Signup or Login to the dashboard.

Use the Microphone Icon to initiate voice commands.

Try commands such as:

“Check my balance”

“Pay my bill”

“Show last 5 transactions”

“Open a fixed deposit”

🔮 8. Future Enhancements
[ ] Advanced deep-learning voice biometrics.

[ ] Complete ISL-based sign-language banking.

[ ] Offline mode for rural connectivity.

[ ] Real bank API + UPI integration.

[ ] Smart financial insights & coaching.

[ ] Real-time fraud alerts & risk scoring.


🎉 9. Credits
Team Powerpuff Girls 🚀

Nistha Sarawagi

Veekshitha Nelluru

Sahasra Ambati
