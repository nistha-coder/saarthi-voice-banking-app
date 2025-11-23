# import joblib
# import spacy
# from flask import Flask, request, jsonify
# import os
# import voice_auth # Import our new voice auth logic

# # 1. Initialize Flask App
# app = Flask(__name__)

# # --- 2. Load Models at Startup ---
# print("Loading models... This may take a moment.")
# try:
#     # Load Intent Model (scikit-learn)
#     intent_model_path = os.path.join("models", "intent_model.pkl")
#     intent_model = joblib.load(intent_model_path)
#     print(f"Successfully loaded intent model from {intent_model_path}")

#     # Load NER Model (spaCy)
#     ner_model_path = os.path.join("models", "ner_model", "model-best")
#     ner_model = spacy.load(ner_model_path)
#     print(f"Successfully loaded NER model from {ner_model_path}")

# except FileNotFoundError as e:
#     print(f"--- FATAL ERROR: Model file not found. {e} ---")
#     print("Please make sure 'models/intent_model.pkl' and 'models/ner_model/model-best' exist.")
#     exit()
# except Exception as e:
#     print(f"An error occurred loading models: {e}")
#     exit()

# print("All models loaded successfully. API is ready.")

# # --- 3. NLP Endpoints ---

# @app.route("/")
# def home():
#     """A simple route to show the API is online."""
#     return "Saarthi AI/ML API is online and ready to serve."

# @app.route("/predict", methods=['POST'])
# def predict_full():
#     """
#     Main NLP endpoint. Receives a user query and returns both
#     intent and extracted entities.
#     """
#     if not request.json or 'query' not in request.json:
#         return jsonify({"error": "Missing 'query' in JSON payload"}), 400

#     query_text = request.json['query']
#     if not query_text:
#         return jsonify({"error": "Missing 'query' value"}), 400

#     try:
#         # 1. Predict Intent
#         intent_prediction = intent_model.predict([query_text])
#         intent = intent_prediction[0]

#         # 2. Extract Entities
#         doc = ner_model(query_text)
#         entities = []
#         for ent in doc.ents:
#             entities.append({
#                 "text": ent.text,
#                 "label": ent.label_
#             })

#         # 3. Format the response
#         response = {
#             "query": query_text,
#             "intent": intent,
#             "entities": entities
#         }
#         return jsonify(response), 200

#     except Exception as e:
#         print(f"Error during prediction: {e}")
#         return jsonify({"error": "An internal error occurred during prediction."}), 500

# # --- 4. Voice Biometrics Endpoints ---

# @app.route("/enroll_voice", methods=['POST'])
# def enroll_voice_endpoint():
#     """
#     Enrolls a user's voice.
#     Expects 'user_id' in form-data and multiple 'audio_sample' files.
#     """
#     if 'user_id' not in request.form:
#         return jsonify({"error": "Missing 'user_id' in form data"}), 400
    
#     user_id = request.form['user_id']
#     audio_files = request.files.getlist('audio_sample')
    
#     if not audio_files:
#         return jsonify({"error": "Missing 'audio_sample' files"}), 400

#     temp_file_paths = []
#     temp_dir = "temp_audio"
#     if not os.path.exists(temp_dir):
#         os.makedirs(temp_dir)

#     try:
#         # Save temporary audio files to disk to be processed
#         for audio_file in audio_files:
#             temp_path = os.path.join(temp_dir, f"{user_id}_{audio_file.filename}")
#             audio_file.save(temp_path)
#             temp_file_paths.append(temp_path)

#         # Call the enrollment logic from our utility file
#         success, message = voice_auth.enroll_user(user_id, temp_file_paths)

#         if success:
#             return jsonify({"status": "success", "message": message}), 200
#         else:
#             return jsonify({"status": "error", "message": message}), 400

#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500
#     finally:
#         # Clean up temporary files
#         for file_path in temp_file_paths:
#             if os.path.exists(file_path):
#                 os.remove(file_path)

# @app.route("/verify_voice", methods=['POST'])
# def verify_voice_endpoint():
#     """
#     Verifies a user's voice for a sensitive action.
#     Expects 'user_id' in form-data and a single 'audio_verification' file.
#     """
#     if 'user_id' not in request.form:
#         return jsonify({"error": "Missing 'user_id' in form data"}), 400
    
#     user_id = request.form['user_id']
#     audio_file = request.files.get('audio_verification')
    
#     if not audio_file:
#         return jsonify({"error": "Missing 'audio_verification' file"}), 400

#     temp_dir = "temp_audio"
#     if not os.path.exists(temp_dir):
#         os.makedirs(temp_dir)
        
#     temp_path = os.path.join(temp_dir, f"{user_id}_verify.wav")

#     try:
#         audio_file.save(temp_path)

#         # Call the verification logic
#         verified, message = voice_auth.verify_user(user_id, temp_path)
        
#         return jsonify({
#             "status": "success",
#             "user_id": user_id,
#             "authenticated": verified,
#             "message": message
#         }), 200

#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500
#     finally:
#         # Clean up temporary file
#         if os.path.exists(temp_path):
#             os.remove(temp_path)


# # @app.route("/faq-answer", methods=['POST'])
# # def faq_answer_endpoint():
# #     if not request.json or 'question' not in request.json:
# #         return jsonify({"error": "Missing 'question'"}), 400

# #     question = request.json['question']
# #     result = get_faq_answer(question)

# #     return jsonify({
# #         "answer": result["answer"],
# #         "confidence": result["confidence"]
# #     }), 200


# # --- 5. Run the App ---
# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5002, debug=True)




























import joblib
import spacy
from flask import Flask, request, jsonify
import os
import voice_auth  # your voice_auth.py module
import traceback

app = Flask(__name__)

# --- Load models at startup ---
print("Loading models... This may take a moment.")
try:
    intent_model_path = os.path.join("models", "intent_model.pkl")
    intent_model = joblib.load(intent_model_path)
    print(f"Successfully loaded intent model from {intent_model_path}")

    ner_model_path = os.path.join("models", "ner_model", "model-best")
    ner_model = spacy.load(ner_model_path)
    print(f"Successfully loaded NER model from {ner_model_path}")

except FileNotFoundError as e:
    print(f"--- FATAL ERROR: Model file not found. {e} ---")
    print("Please make sure 'models/intent_model.pkl' and 'models/ner_model/model-best' exist.")
    raise SystemExit(1)
except Exception as e:
    print(f"An error occurred loading models: {e}")
    traceback.print_exc()
    raise SystemExit(1)

print("All models loaded successfully. API is ready.")

# --- Routes ---

@app.route("/")
def home():
    return "Saarthi AI/ML API is online and ready to serve."

@app.route("/predict", methods=["POST"])
def predict_full():
    if not request.json or "query" not in request.json:
        return jsonify({"error": "Missing 'query' in JSON payload"}), 400

    query_text = request.json["query"]
    if not query_text:
        return jsonify({"error": "Missing 'query' value"}), 400

    try:
        intent_prediction = intent_model.predict([query_text])
        intent = intent_prediction[0]

        doc = ner_model(query_text)
        entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]

        return jsonify({"query": query_text, "intent": intent, "entities": entities}), 200

    except Exception as e:
        print(f"Error during prediction: {e}")
        traceback.print_exc()
        return jsonify({"error": "An internal error occurred during prediction."}), 500

# --- Voice biometrics endpoints ---

TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.route("/enroll_voice", methods=["POST"])
def enroll_voice_endpoint():
    """
    Enrolls a user's voice.
    Expects 'user_id' in form-data and multiple 'audio_sample' files (at least 3).
    """
    try:
        if "user_id" not in request.form:
            return jsonify({"status": "error", "message": "Missing 'user_id' in form data"}), 400

        user_id = request.form["user_id"]
        audio_files = request.files.getlist("audio_sample")

        if not audio_files or len(audio_files) == 0:
            return jsonify({"status": "error", "message": "Missing 'audio_sample' files"}), 400

        if len(audio_files) < 3:
            return jsonify({
                "status": "error",
                "message": "Please upload at least 3 audio samples for reliable enrollment."
            }), 400

        temp_paths = []
        # Save incoming files to disk
        for idx, audio in enumerate(audio_files):
            fname = audio.filename or f"sample_{idx}.webm"
            safe_name = f"{user_id}_{idx}_{os.path.basename(fname)}"
            out_path = os.path.join(TEMP_DIR, safe_name)
            audio.save(out_path)
            temp_paths.append(out_path)
            print(f"[ENROLL] saved temporary file: {out_path}")

        # Call enrollment logic
        success, message = voice_auth.enroll_user(user_id, temp_paths)
        # Clean up temporary files (best-effort)
        for p in temp_paths:
            try:
                if os.path.exists(p):
                    os.remove(p)
            except Exception:
                pass

        if success:
            return jsonify({"status": "success", "message": message}), 200
        else:
            return jsonify({"status": "error", "message": message}), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "error", "message": f"Internal server error: {e}"}), 500

@app.route("/verify_voice", methods=["POST"])
def verify_voice_endpoint():
    """
    Verifies a user's voice.
    Expects 'user_id' in form-data and a single 'audio_verification' file.
    """
    try:
        if "user_id" not in request.form:
            return jsonify({"status": "error", "message": "Missing 'user_id' in form data"}), 400

        user_id = request.form["user_id"]
        audio_file = request.files.get("audio_verification")

        if not audio_file:
            return jsonify({"status": "error", "message": "Missing 'audio_verification' file"}), 400

        # Save verification file
        fname = audio_file.filename or f"{user_id}_verify.webm"
        safe_name = f"{user_id}_verify_{os.path.basename(fname)}"
        out_path = os.path.join(TEMP_DIR, safe_name)
        audio_file.save(out_path)
        print(f"[VERIFY] saved temporary file: {out_path}")

        verified, message = voice_auth.verify_user(user_id, out_path)

        # cleanup
        try:
            if os.path.exists(out_path):
                os.remove(out_path)
        except Exception:
            pass

        return jsonify({
            "status": "success",
            "user_id": user_id,
            "authenticated": bool(verified),
            "message": message
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "error", "message": f"Internal server error: {e}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
