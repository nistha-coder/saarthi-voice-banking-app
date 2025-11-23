from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
from rag_faq.rag_faq import get_faq_answer

app = Flask(__name__)
CORS(app)

# --- 1. Load the Intent Model (One-time setup) ---
print("⏳ Loading Intent Model...")
intent_model_path = "intent_model.pkl"

if os.path.exists(intent_model_path):
    with open(intent_model_path, "rb") as f:
        intent_model = pickle.load(f)
    print("✅ Intent Model Loaded!")
else:
    intent_model = None
    print("⚠️ Warning: intent_model.pkl not found. Run train_intent.py first.")

# --- 2. Routes ---

@app.route("/")
def home():
    return "Saarthi AI Engine is Running on Port 5001!"

# API 1: THE ROUTER (Task 1.1)
# Decides what the user wants to do
@app.route("/predict-intent", methods=["POST"])
def predict_intent():
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        if not intent_model:
            return jsonify({"error": "Model not loaded"}), 500

        # Ask the Brain
        prediction = intent_model.predict([text])[0]
        
        # Return the intent
        return jsonify({
            "intent": prediction,
            "confidence": 1.0 # (Simple models don't always give score, assuming 1.0 for now)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API 2: THE KNOWLEDGE BASE (Task 1.4)
# Answers questions like "What is an FD?"
@app.route("/faq-answer", methods=["POST"])
def faq_answer():
    try:
        data = request.get_json()
        user_question = data.get("question", "")
        
        # Call RAG system
        result = get_faq_answer(user_question)
        
        MIN_CONFIDENCE = 0.60
        current_confidence = result.get("confidence", 0) if result else 0

        if result is None or current_confidence < MIN_CONFIDENCE:
            return jsonify({
                "answer": "I'm not completely sure about this. Could you please rephrase?",
                "confidence": current_confidence
            })

        return jsonify({
            "answer": result.get("answer", "No answer found"),
            "confidence": round(float(current_confidence), 3)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)