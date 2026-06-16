# 🌟 Saarthi — Intelligent Voice Banking Assistant

> **"Banking for everyone, in every language, through every ability."**

Saarthi is a full-stack, AI-powered digital banking assistant built to make banking simple, safe, and accessible for all — with a special focus on elderly users, rural communities, visually impaired individuals, and people who struggle with traditional banking interfaces. Users can interact entirely through **voice**, **text**, or prototype-level **sign language support**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Reference](#-api-reference)
- [How to Use](#-how-to-use)
- [Security Model](#-security-model)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)

---

## 📘 Overview

Saarthi (Hindi for "companion" or "guide") is built on a **Hybrid Microservices Architecture** consisting of four independently runnable services:

| Service | Technology | Port | Purpose |
|---|---|---|---|
| Frontend (Client) | React 18 + Vite | `5173` | UI, voice input/output, routing |
| Backend (Server) | Node.js + Express + MongoDB | `3001` | Auth, banking APIs, TTS proxy |
| AI Engine | Python + Flask + FAISS | `5001` | Intent classification, RAG FAQ |
| ML API | Python + Flask + Librosa | `5002` | Voice biometrics, NER |

---

## ✨ Key Features

### 🏦 Core Banking Operations
- Check account balance
- View transaction history
- Transfer funds between accounts
- Manage fixed deposits (FD)
- Pay bills and mobile recharges
- Raise and track complaints
- Link ATM card, set mPIN, create UPI ID

### 🤖 AI Capabilities
- **Voice Interaction** — Web Speech API for real-time speech-to-text input and text-to-speech output via Google Cloud TTS
- **Intent Detection** — Scikit-Learn classifier (`intent_model.pkl`) routes user queries to the correct banking action
- **Smart FAQ (RAG)** — FAISS vector database + Sentence Transformers for semantic retrieval, with optional Gemini API for generative answers
- **Conversational Bot** — General-purpose chatbot endpoint for free-form banking queries

### 🔐 Security
- **JWT Authentication** — Stateless token-based auth for all protected API routes
- **mPIN Verification** — Secondary PIN required for sensitive transactions (transfers, payments)
- **Voice Biometrics** — Prototype-level speaker authentication using MFCC feature extraction (Librosa)
- **Rate Limiting** — Configurable request throttling to prevent brute-force attacks
- **Audio Upload Validation** — Multer-based file filtering (type + size) on audio submissions

### ♿ Accessibility
- **Multilingual UI** — English and Hindi support via `i18next` with browser language detection
- **Voice-First Design** — Every core flow is completable via microphone alone
- **High-Contrast UI** — Clean visual design for low-vision users
- **Sign Language (Prototype)** — SignLearn integration scaffolded for ISL support
- **Animated Background** — Consistent, calming UI layer across all pages

---

## 🛠 Tech Stack

### Frontend — `client/`
| Tool | Version | Purpose |
|---|---|---|
| React | ^18.2.0 | UI framework |
| Vite | ^5.0.8 | Build tool & dev server |
| React Router DOM | ^6.20.0 | Client-side routing |
| i18next + react-i18next | ^25.6.2 / ^16.3.3 | Internationalization (EN/HI) |
| i18next-browser-languagedetector | ^8.2.0 | Auto-detect browser language |
| Framer Motion | ^11.18.2 | Animations |
| Axios | ^1.6.0 | HTTP client |
| React Icons | ^4.12.0 | Icon library |
| Web Speech API | Native browser | Voice input + output |

### Backend — `server/`
| Tool | Version | Purpose |
|---|---|---|
| Node.js + Express | ^5.1.0 | REST API server |
| Mongoose | ^8.19.4 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | JWT auth |
| bcrypt | ^6.0.0 | Password hashing |
| multer | ^1.4.5-lts.1 | Audio file uploads |
| @google-cloud/text-to-speech | ^6.4.0 | TTS synthesis |
| @google-cloud/translate | ^9.3.0 | Text translation |
| fluent-ffmpeg + ffmpeg-static | ^2.1.3 | Audio processing |
| web-push | ^3.6.7 | Push notifications (VAPID) |
| node-cron | ^3.0.2 | Scheduled tasks |
| qrcode | ^1.5.4 | QR code generation |
| dotenv | ^17.2.3 | Environment config |

### AI Engine — `ai_engine/`
| Tool | Purpose |
|---|---|
| Flask + flask-cors | REST API server |
| sentence-transformers | Semantic text embeddings |
| faiss-cpu | Vector similarity search (RAG) |
| pandas | Data handling |
| google-generativeai | Gemini API for generative answers |
| scikit-learn (via pickle) | Intent classification model |
| python-dotenv | Environment config |

### ML Service — `ml-saarthi/saarthi-ml-api/`
| Tool | Purpose |
|---|---|
| Flask | REST API server |
| Librosa | MFCC feature extraction for voice auth |
| spaCy | Named Entity Recognition (NER) |
| joblib | Model serialization |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER (Browser)                        │
│         Voice / Text / Sign Language Input               │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              REACT FRONTEND  (Port 5173)                 │
│  React Router │ i18next │ Framer Motion │ Web Speech API │
│  Contexts: AuthContext │ LanguageContext │ AppStateContext│
│  Pages: Landing │ Login │ Signup │ Dashboard │ History   │
│         Profile │ FAQ │ Payments │ MobileRecharge etc.   │
└──────┬──────────────────────────┬────────────────────────┘
       │ REST (Axios)             │ REST (Axios)
       ▼                          ▼
┌──────────────────┐    ┌─────────────────────────────────┐
│  NODE.JS BACKEND │    │       AI ENGINE  (Port 5001)     │
│   (Port 3001)    │    │  Flask │ FAISS │ Sentence-BERT   │
│                  │◄──►│  /predict-intent                 │
│  Routes:         │    │  /faq-answer  (RAG)              │
│  /api/auth       │    │  Gemini API (optional)           │
│  /api/user       │    └─────────────────────────────────┘
│  /api/assistant  │
│  /api/faq        │    ┌─────────────────────────────────┐
│  /api/bot        │    │    ML SERVICE   (Port 5002)      │
│  /api/tts        │◄──►│  Flask │ Librosa │ spaCy        │
│                  │    │  Voice Biometrics (MFCC)         │
│  Middleware:     │    │  Named Entity Recognition        │
│  JWT Auth        │    └─────────────────────────────────┘
│  Rate Limiting   │
│  Error Handler   │    ┌─────────────────────────────────┐
│                  │◄──►│  Google Cloud APIs               │
│  Database:       │    │  Text-to-Speech │ Translate      │
│  MongoDB         │    └─────────────────────────────────┘
└──────────────────┘
```

### Request Flow — Voice Command
```
User speaks → Web Speech API (STT) → React
→ POST /api/assistant/ask → Node.js backend
→ POST /predict-intent (AI Engine @ 5001)
← Intent returned (e.g. "check_balance")
→ Execute banking logic (fetch from MongoDB)
← Response text
→ POST /api/tts → Google Cloud TTS
← Audio buffer → Browser plays response
```

---

## 📁 Project Structure

```
saarthi-voice-banking-app/
│
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      # JWT auth state
│   │   │   ├── LanguageContext.jsx  # i18n language state
│   │   │   └── AppStateContext.jsx  # Global app state
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── AnimatedBackground.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── TransactionHistoryPage.jsx
│   │   │   ├── FaqPage.jsx
│   │   │   ├── LinkAtmPage.jsx
│   │   │   ├── setMpinPage.jsx
│   │   │   ├── CreateUpiIdPage.jsx
│   │   │   ├── MobileRechargePage.jsx
│   │   │   ├── BillPaymentsPage.jsx
│   │   │   ├── MakePaymentPage.jsx
│   │   │   └── ReminderPage.jsx
│   │   ├── App.jsx                  # Router + providers setup
│   │   ├── main.jsx                 # React DOM entry point
│   │   └── index.css
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── controllers/
│   │   ├── authController.js        # Signup/login + voice enroll
│   │   ├── userController.js        # Dashboard, profile, ATM, mPIN, UPI
│   │   ├── assistantController.js   # Voice assistant + history
│   │   ├── botController.js         # General chatbot
│   │   └── ttsController.js         # Google TTS proxy
│   ├── routes/
│   │   ├── authRoutes.js            # POST /signup, /login (audio upload)
│   │   ├── userRoutes.js            # GET/POST user banking endpoints
│   │   ├── assistantRoutes.js       # Voice assistant endpoints
│   │   ├── faqRoutes.js             # FAQ proxy to AI engine
│   │   ├── botRoutes.js             # POST /api/bot/ask
│   │   └── ttsRoutes.js             # TTS synthesis endpoint
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   └── errorHandler.js          # Global error handler
│   ├── config/
│   │   └── google-tts.json          # Google Cloud service account (gitignored)
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── ai_engine/                       # FAQ + Intent classification service
│   ├── rag_faq/
│   │   └── rag_faq.py               # FAISS-based RAG retrieval logic
│   ├── app.py                       # Flask app (routes: /predict-intent, /faq-answer)
│   ├── train_intent.py              # Script to train & save intent_model.pkl
│   ├── intent_model.pkl             # Trained Scikit-Learn intent classifier
│   ├── requirements.txt
│   └── .env                         # GOOGLE_API_KEY (gitignored)
│
└── ml-saarthi/
    └── saarthi-ml-api/              # Voice biometrics + NER service
        ├── voice_auth.py            # MFCC-based voice authentication
        ├── app.py                   # Flask app (voice + NER routes)
        ├── models/
        │   ├── intent_model.pkl     # Intent model copy
        │   └── ner_model/           # spaCy NER model (model-best/)
        └── requirements.txt
```

---

## ✅ Prerequisites

Make sure the following are installed on your system before setup:

| Requirement | Version | Check |
|---|---|---|
| Node.js | ≥ 18.x | `node --version` |
| npm | ≥ 9.x | `npm --version` |
| Python | ≥ 3.9 | `python --version` |
| pip | Latest | `pip --version` |
| MongoDB | ≥ 6.x (local) or Atlas URI | `mongod --version` |
| FFmpeg | Any recent | `ffmpeg -version` |

**Optional but recommended:**
- A Google Cloud project with **Text-to-Speech API** and **Cloud Translate API** enabled
- A **Gemini API key** for generative FAQ answers
- A Google Cloud service account JSON file for TTS

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/nistha-coder/saarthi-voice-banking-app.git
cd saarthi-voice-banking-app
```

### Step 2 — Set Up the Frontend

```bash
cd client
npm install
```

### Step 3 — Set Up the Backend

```bash
cd ../server
npm install
```

### Step 4 — Set Up the AI Engine

```bash
cd ../ai_engine
pip install -r requirements.txt
```

> **Note:** If you haven't trained the intent model yet, run:
> ```bash
> python train_intent.py
> ```
> This generates `intent_model.pkl`, which is required before starting the AI engine.

### Step 5 — Set Up the ML Service

```bash
cd ../ml-saarthi/saarthi-ml-api
pip install -r requirements.txt
```

> **Note:** The ML service also requires pre-trained model files:
> - `models/intent_model.pkl`
> - `models/ner_model/model-best/` (spaCy NER model)
> 
> Place these in the `models/` directory before starting the service.

---

## 🔐 Environment Variables

> ⚠️ **Never commit `.env` files to version control.** Add them to `.gitignore`.

### `server/.env`

Create a file at `server/.env` with the following content:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/saarthi

# Authentication
JWT_SECRET=your-strong-jwt-secret-key-here

# External Service URLs
ML_API_URL=http://localhost:5002
FAQ_API_URL=http://localhost:5001

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# OTP (Demo)
DEMO_OTP=123456

# Sessions
SESSION_SECRET=your-session-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Google Cloud TTS
GOOGLE_APPLICATION_CREDENTIALS=./config/google-tts.json
GOOGLE_PROJECT_ID=your-google-project-id

# Web Push Notifications (optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
EMAIL_FROM=your-email@example.com
```

### `ai_engine/.env`

Create a file at `ai_engine/.env`:

```env
# Gemini API (optional — for generative FAQ answers)
GOOGLE_API_KEY=your-gemini-or-google-api-key
```

### ML Service

The ML service uses a `config.cfg` file for configuration — no `.env` required.

---

## ▶️ Running the Application

You need to run **4 services simultaneously** — open 4 separate terminal windows/tabs.

### Terminal 1 — Frontend

```bash
cd client
npm run dev
# → Running at http://localhost:5173
```

### Terminal 2 — Backend

```bash
cd server
node server.js
# For development with auto-reload:
# npm run dev   (uses nodemon)
# → Running at http://localhost:3001
```

### Terminal 3 — AI Engine

```bash
cd ai_engine
python app.py
# → Running at http://localhost:5001
```

### Terminal 4 — ML Service

```bash
cd ml-saarthi/saarthi-ml-api
python app.py
# → Running at http://localhost:5002
```

### Verify All Services

| URL | Expected Response |
|---|---|
| `http://localhost:5173` | React app loads in browser |
| `http://localhost:3001/health` | `{"status":"ok"}` |
| `http://localhost:5001/` | `"Saarthi AI Engine is Running on Port 5001!"` |
| `http://localhost:5002/` | ML API status message |

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | None | `multipart/form-data` — user fields + up to 5 `audio_sample` files | Register new user with optional voice enrollment |
| `POST` | `/api/auth/login` | None | `multipart/form-data` — credentials + optional `audio` file | Login and receive JWT token |

### User Routes — `/api/user` *(JWT required)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/details` | Fetch full dashboard data (balance, FDs, etc.) |
| `GET` | `/api/user/transactions` | Fetch transaction history |
| `GET` | `/api/user/profile` | Get user profile |
| `POST` | `/api/user/link-atm` | Link ATM card to account |
| `POST` | `/api/user/set-mpin` | Set transaction mPIN |
| `POST` | `/api/user/verify-mpin` | Verify mPIN before sensitive transactions |
| `POST` | `/api/user/create-upi` | Create UPI ID |
| `POST` | `/api/user/update-balance` | Update account balance (post-transaction) |

### Assistant Routes — `/api/assistant`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/assistant/verify-voice` | None | Verify speaker identity via audio upload |
| `POST` | `/api/assistant/ask` | None | Main NLU endpoint — pass text query, get intent + response |
| `POST` | `/api/assistant/complete-sensitive` | JWT | Complete a sensitive action after mPIN verification |
| `GET` | `/api/assistant/history` | JWT | Retrieve conversation history |

### Bot / FAQ Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bot/ask` | None | General conversational bot response |
| `POST` | `/api/faq/...` | None | Proxies to AI Engine FAQ endpoint |
| `POST` | `/api/tts/...` | None | Synthesize speech via Google Cloud TTS |

### AI Engine Routes (Port 5001)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/predict-intent` | `{ "text": "..." }` | Returns `{ intent, confidence }` |
| `POST` | `/faq-answer` | `{ "question": "..." }` | Returns RAG-based answer |

---

## 🗺 How to Use

1. Open your browser and navigate to `http://localhost:5173`.

2. **Sign Up** — Create an account. During signup, you can optionally record voice samples for biometric enrollment (up to 5 audio clips).

3. **Log In** — Authenticate with your credentials. Voice login is supported at the prototype level.

4. **Dashboard** — View your account balance, recent transactions, and quick-action cards.

5. **Voice Commands** — Click the **microphone icon** and speak naturally. Example commands:

   - *"Check my balance"*
   - *"Show my last 5 transactions"*
   - *"Transfer ₹500 to Priya"*
   - *"Pay my electricity bill"*
   - *"Recharge my mobile with ₹199"*
   - *"Open a fixed deposit"*
   - *"What is a savings account?"* (FAQ)

6. **Text Mode** — Type queries directly into the chat interface if you prefer not to use voice.

7. **Language Toggle** — Switch between English and Hindi from the language selector in the UI.

8. **Sensitive Actions** — Transfers and payments prompt for your **mPIN** before executing.

---

## 🔒 Security Model

Saarthi uses a layered security approach:

```
Layer 1 — Password Auth    →  bcrypt-hashed passwords in MongoDB
Layer 2 — JWT Tokens       →  Short-lived tokens on all /api/user & /api/assistant routes
Layer 3 — mPIN             →  Secondary PIN required for fund transfers & bill pay
Layer 4 — Voice Biometrics →  MFCC fingerprint comparison (prototype)
Layer 5 — Rate Limiting    →  Configurable window + max-requests per IP
Layer 6 — Input Validation →  Multer file-type + size limits on audio uploads
```

**Important notes for production deployment:**
- Rotate `JWT_SECRET` to a cryptographically random 256-bit value.
- Enable HTTPS — never run over plain HTTP in production.
- Replace mock MongoDB JSON files with a real MongoDB Atlas cluster.
- Scope Google Cloud service account permissions to the minimum required.
- Store `VAPID_PRIVATE_KEY` in a secrets manager (AWS Secrets Manager, GCP Secret Manager, etc.).

---

## 🔮 Future Roadmap

| Feature | Status |
|---|---|
| Deep-learning voice biometrics (end-to-end neural speaker ID) | Planned |
| Full ISL (Indian Sign Language) banking interface | In progress |
| Offline mode for low-connectivity rural areas | Planned |
| Real bank API + UPI integration (RBI sandbox) | Planned |
| Smart financial insights & AI-driven coaching | Planned |
| Real-time fraud detection & risk scoring | Planned |
| More Indian languages (Tamil, Telugu, Bengali, Marathi) | Planned |
| Mobile app (React Native) | Planned |

---

## 👩‍💻 Team

**Team Name: Powerpuff Girls 🚀**

| Name | Role |
|---|---|
| Nistha Sarawagi | Full-Stack & AI Pipeline |
| Veekshitha Nelluru | UI/UX & Accessibility |
| Sahasra Ambati | Backend & ML Integration |

---

## 📹 Demo

**Video Demo:** [Watch on Google Drive](https://drive.google.com/file/d/1E9HX5dZMQYzE4MgrN53kJ4GSLJpsD5WF/view?usp=drivesdk)

---

## 📄 License

This project was built for a hackathon. Licensing terms to be determined by the team.

---

<p align="center">Built with ❤️ for inclusive banking in India</p>
