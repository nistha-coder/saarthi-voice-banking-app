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
