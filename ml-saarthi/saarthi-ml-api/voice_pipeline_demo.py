import requests
import speech_recognition as sr
from gtts import gTTS
import os

# --- 1. CONFIGURATION ---
NLP_API_URL = "http://127.0.0.1:5000/predict"
# This MUST be a true, 16-bit PCM WAV file.
SAMPLE_AUDIO_FILE = "test_audio.wav" 

# --- 2. SPEECH-TO-TEXT (STT) ---
def convert_audio_to_text(audio_file_path):
    """
    Converts a *proper* WAV file to text using Google's STT.
    Handles Hinglish (en-IN).
    """
    recognizer = sr.Recognizer()
    
    # Load and convert audio file
    with sr.AudioFile(audio_file_path) as source:
        print("Demo: Reading audio file...")
        audio_data = recognizer.record(source)

    try:
        print("Demo: Sending to Google STT...")
        # 'en-IN' is excellent for understanding Hinglish
        text = recognizer.recognize_google(audio_data, language="en-IN")
        print(f"STT Result: '{text}'")
        return text
    except sr.UnknownValueError:
        print("STT Error: Could not understand audio")
        return None
    except sr.RequestError as e:
        print(f"STT Error: Could not request results; {e}")
        return None

# --- 3. CALL OUR NLP API ---
def get_nlp_prediction(text):
    """
    Sends text to our running Flask API and gets intent/entities.
    """
    try:
        print(f"Demo: Sending to our NLP API at {NLP_API_URL}...")
        response = requests.post(NLP_API_URL, json={"query": text})
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"NLP API Error: {response.status_code}")
            return None
    except requests.ConnectionError:
        print("\n--- FATAL ERROR ---")
        print(f"Could not connect to the NLP API at {NLP_API_URL}")
        print("Is your 'app.py' server running in another terminal?")
        print("-------------------")
        return None
    except Exception as e:
        print(f"An unknown error occurred: {e}")
        return None

# --- 4. TEXT-TO-SPEECH (TTS) ---
def generate_spoken_response(text, lang='hi'):
    """
    Converts a response text string into an audio file using gTTS.
    """
    print(f"Demo: Generating audio for response: '{text}'")
    tts = gTTS(text=text, lang=lang, slow=False)
    
    output_file = "response.mp3"
    tts.save(output_file)
    print(f"Demo: Saved response audio to {output_file}")
    return output_file

# --- 5. THE MAIN PIPELINE ---
def run_pipeline():
    if not os.path.exists(SAMPLE_AUDIO_FILE):
        print(f"Error: Demo file not found: {SAMPLE_AUDIO_FILE}")
        print("Please convert your audio to a 16-bit PCM WAV and save it.")
        return

    # 1. STT
    user_text = convert_audio_to_text(SAMPLE_AUDIO_FILE)
    if not user_text:
        return

    # 2. NLP (Call our API)
    nlp_result = get_nlp_prediction(user_text)
    if not nlp_result:
        return
        
    print(f"NLP API Result: {nlp_result}")
    
    # 3. Backend Logic (Demo)
    intent = nlp_result.get("intent", "unknown")
    
    if intent == "fund_transfer":
        response_text = "ठीक है, मैं पैसे भेज रही हूँ।"
    elif intent == "balance_inquiry":
        response_text = "मैं आपका बैलेंस चेक कर रही हूँ।"
    else:
        response_text = "मुझे समझ आ गया है।"

    # 4. TTS
    generate_spoken_response(response_text)
    print("\nDemo Complete. Check 'response.mp3' to hear the result.")


if __name__ == "__main__":
    run_pipeline()