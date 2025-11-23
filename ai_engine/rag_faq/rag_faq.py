import faiss
import pickle
from sentence_transformers import SentenceTransformer
import numpy as np
import os
import google.generativeai as genai
from dotenv import load_dotenv  # <--- Import this to read the .env file

# ==============================
# 🔑 CONFIGURATION (SECURE)
# ==============================

# 1. Load variables from .env file
# This looks for a file named ".env" in the main folder or current folder
load_dotenv()

# 2. Get the API Key safely from the environment
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Error: GOOGLE_API_KEY not found. Make sure you have a .env file!")
else:
    genai.configure(api_key=api_key)

# 3. Setup AI Model
# We use 'gemini-flash-latest' as it was found in your available models list
try:
    ai_model = genai.GenerativeModel('gemini-flash-latest')
    print("Gemini API Key Loaded:", bool(api_key))

except:
    # Fallback just in case, though flash-latest should work
    ai_model = genai.GenerativeModel('gemini-pro')

# ==============================
# 📂 LOAD LOCAL RESOURCES
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
index_path = os.path.join(BASE_DIR, "faq.index")
answers_path = os.path.join(BASE_DIR, "faq_answers.pkl")

model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index(index_path)

with open(answers_path, "rb") as f:
    answers = pickle.load(f)

def get_faq_answer(user_question):
    if not user_question:
        return None

    # --- Step A: Local Search (FAISS) ---
    question_embedding = model.encode([user_question], convert_to_numpy=True)
    distances, indices = index.search(question_embedding, k=1)
    
    best_idx = int(indices[0][0])
    distance = float(distances[0][0])
    confidence = float(np.exp(-distance))
    
    best_match = answers[best_idx]
    print("Closest match:", best_match["question"])
    print("Distance:", distance)
    print("FAISS Confidence:", confidence)

    # --- Step B: Hybrid Logic ---
    # Threshold: 0.50 (If local match is good enough, use it)
   # --- Step B: Hybrid Logic ---
    # CHANGE THIS NUMBER: 0.50 -> 0.75
    if confidence >= 0.45: 
        print(f"✅ High confidence ({confidence:.2f}). Using Local FAQ.") # <--- Add this print to see what happens
        return {
            "answer": best_match["answer"],
            "question": best_match["question"],
            "confidence": confidence
        }
    
    # --- Step C: Cloud AI (Gemini) ---
    else:
        print(f"⚠️ Low confidence ({confidence:.2f}). Asking Gemini...")
        try:
            if not api_key:
                return {
                    "answer": "I am unable to connect to AI because the API Key is missing.",
                    "question": "Configuration Error",
                    "confidence": 0.0
                }

            # Prompt the AI
            prompt = f"You are a helpful banking assistant named Saarthi. Answer this strictly in 2-3 sentences: {user_question}"
            response = ai_model.generate_content(prompt)
            
            # Debugging: Print answer to terminal
            print(f"🤖 Gemini Replied: {response.text}") 

            return {
                "answer": response.text,
                "question": "General Banking Logic (AI)",
                "confidence": 0.95
            }
        except Exception as e:
            print(f"❌ Gemini Error: {e}")
            return {
                "answer": "I am unable to connect to the internet right now.",
                "question": "Connection Error",
                "confidence": 0.0
            }