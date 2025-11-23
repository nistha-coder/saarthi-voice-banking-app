# import librosa
# import numpy as np
# from scipy.spatial.distance import cosine
# import os
# import joblib

# # Directory to store the saved voiceprints
# VOICEPRINT_DIR = "voiceprints"
# # We'll use 20 MFCC coefficients
# N_MFCCS = 20
# # Similarity threshold for verification (you'll need to tune this)
# VERIFICATION_THRESHOLD = 0.85 # 60% similarity

# # def extract_features(audio_file_path):
# #     """
# #     Extracts MFCC features from an audio file.
# #     Returns a single, averaged feature vector.
# #     """
# #     try:
# #         # Load the audio file
# #         # sr=22050 is a standard sample rate for this
# #         y, sr = librosa.load(audio_file_path, sr=22050)
        
# #         # Extract MFCCs
# #         mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCCS)
        
# #         # To get a single feature vector for the entire clip,
# #         # we calculate the mean of the MFCCs over time.
# #         features = np.mean(mfccs.T, axis=0)
# #         return features
        
# #     except Exception as e:
# #         print(f"Error extracting features from {audio_file_path}: {e}")
# #         return None



# def extract_features(audio_file_path):
#     try:
#         y, sr = librosa.load(audio_file_path, sr=22050)
#         # Reject silent recordings
#         if np.mean(np.abs(y)) < 0.001:
#           print("Silent or empty recording detected")
#           return None

#         # MFCC
#         mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)

#         # Delta MFCC (speed)
#         mfcc_delta = librosa.feature.delta(mfcc)

#         # Delta-Delta MFCC (acceleration)
#         mfcc_delta2 = librosa.feature.delta(mfcc, order=2)

#         # Stack features
#         combined = np.vstack([mfcc, mfcc_delta, mfcc_delta2])

#         # Average over time → final embedding
#         features = np.mean(combined.T, axis=0)

#         return features
        
#     except Exception as e:
#         print(f"Error extracting features: {e}")
#         return None




# def enroll_user(user_id, audio_file_paths):
#     """
#     Enrolls a new user by creating and saving their average voiceprint.
#     - user_id: A unique ID for the user (e.g., 'veeksha')
#     - audio_file_paths: A list of file paths to their audio samples (e.g., ['sample1.wav', 'sample2.wav'])
#     """
#     if not os.path.exists(VOICEPRINT_DIR):
#         os.makedirs(VOICEPRINT_DIR)

#     all_features = []
#     print(f"Enrolling user {user_id}...")
#     for file_path in audio_file_paths:
#         features = extract_features(file_path)
#         if features is not None:
#             all_features.append(features)
    
#     if not all_features:
#         return False, "Failed to extract any features from the provided audio files."

#     # Create the final voiceprint by averaging the features from all samples
#     voiceprint = np.mean(all_features, axis=0)
    
#     # Save the voiceprint
#     out_path = os.path.join(VOICEPRINT_DIR, f"{user_id}.vpr")
#     try:
#         joblib.dump(voiceprint, out_path)
#         print(f"Successfully enrolled user {user_id}. Voiceprint saved to {out_path}.")
#         return True, f"User {user_id} enrolled successfully."
#     except Exception as e:
#         return False, f"Failed to save voiceprint: {e}"

# def verify_user(user_id, verification_audio_path):
#     """
#     Verifies a user against their enrolled voiceprint.
#     - user_id: The user's unique ID
#     - verification_audio_path: File path to the new audio sample for verification
#     """
#     voiceprint_path = os.path.join(VOICEPRINT_DIR, f"{user_id}.vpr")
    
#     # 1. Check if the user is enrolled
#     if not os.path.exists(voiceprint_path):
#         return False, "User is not enrolled."

#     try:
#         # 2. Load the user's enrolled voiceprint
#         enrolled_voiceprint = joblib.load(voiceprint_path)
        
#         # 3. Get features for the new verification audio
#         verification_features = extract_features(verification_audio_path)
#         if verification_features is None:
#             return False, "Failed to extract features from verification audio."

#         # 4. Compare them using cosine similarity
#         # The 'cosine' function calculates distance (0.0 = identical, 1.0 = opposite)
#         # So, similarity = 1 - distance
#         distance = cosine(enrolled_voiceprint, verification_features)
#         similarity = 1 - distance
        
#         print(f"Verification attempt for {user_id}. Similarity: {similarity:.2f}")

#         # 5. Check against the threshold
#         if similarity > VERIFICATION_THRESHOLD:
#             return True, f"User {user_id} verified. (Similarity: {similarity:.2f})"
#         else:
#             return False, f"Verification failed. (Similarity: {similarity:.2f})"
            
#     except Exception as e:
#         return False, f"An error occurred during verification: {e}"





































import librosa
import numpy as np
from scipy.spatial.distance import cosine
import os
import joblib
import traceback

VOICEPRINT_DIR = "voiceprints"
os.makedirs(VOICEPRINT_DIR, exist_ok=True)

# Use more MFCCs + delta features
N_MFCCS = 40
# Tuneable threshold (you changed to 0.85). Keep this high if you want strict matching.
VERIFICATION_THRESHOLD = 0.975

def extract_features(audio_file_path, expected_sr=22050):
    """
    Extract MFCC + delta + delta2 features and return an averaged feature vector.
    Returns None on failure or if audio is too silent.
    """
    try:
        y, sr = librosa.load(audio_file_path, sr=expected_sr)
        if y is None or len(y) == 0:
            print(f"[FEATURE] Empty audio at {audio_file_path}")
            return None

        # Reject extremely silent recordings
        # if np.mean(np.abs(y)) < 1e-4:
        #     print(f"[FEATURE] Silent or near-silent audio detected: {audio_file_path}")
        #     return None
        # 1️⃣ Reject silence
        energy = np.mean(np.abs(y))
        if energy < 0.02:    # was 0.001
            print("Rejected: Silent or very low-energy audio")
            return None

        # 2️⃣ Reject too short recordings
        if len(y) < sr * 1:
            print("Rejected: audio too short (< 1 sec)")
            return None
        # Extract MFCCs
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCCS)
        # Delta and delta-delta
        delta = librosa.feature.delta(mfcc)
        delta2 = librosa.feature.delta(mfcc, order=2)

        stacked = np.vstack([mfcc, delta, delta2])
        # Average over time frames to get a single vector
        features = np.mean(stacked.T, axis=0)

        # Normalize vector (optional but improves cosine behavior)
        norm = np.linalg.norm(features)
        if norm > 0:
            features = features / norm

        return features

    except Exception as e:
        print(f"[FEATURE] Error extracting features from {audio_file_path}: {e}")
        traceback.print_exc()
        return None

def enroll_user(user_id, audio_file_paths):
    """
    audio_file_paths: list of file paths (wav/webm converted to wav)
    Returns (True, message) on success, (False, message) on failure.
    """
    try:
        features_list = []
        for p in audio_file_paths:
            f = extract_features(p)
            if f is not None:
                features_list.append(f)
            else:
                print(f"[ENROLL] Feature extraction failed for: {p}")

        if len(features_list) == 0:
            return False, "No valid audio features extracted. Please re-record samples."

        # Average voiceprint
        voiceprint = np.mean(features_list, axis=0)
        out_path = os.path.join(VOICEPRINT_DIR, f"{user_id}.vpr")
        joblib.dump(voiceprint, out_path)
        print(f"[ENROLL] Saved voiceprint for {user_id} -> {out_path}")
        return True, f"User {user_id} enrolled successfully."

    except Exception as e:
        traceback.print_exc()
        return False, f"Enrollment failed: {e}"

def verify_user(user_id, verification_audio_path):
    """
    Returns (True, message) if voice matches the enrolled voiceprint,
    otherwise (False, message).
    """
    try:
        vpath = os.path.join(VOICEPRINT_DIR, f"{user_id}.vpr")
        if not os.path.exists(vpath):
            return False, "User is not enrolled."

        enrolled = joblib.load(vpath)
        if enrolled is None or len(enrolled) == 0:
            return False, "Enrolled voiceprint is invalid."

        features = extract_features(verification_audio_path)
        if features is None:
            return False, "Failed to extract features from verification audio."

        # Compute cosine similarity (1 - distance)
        distance = cosine(enrolled, features)
        # Handle possible NaN
        if np.isnan(distance):
            return False, "Cosine distance produced NaN."

        similarity = 1.0 - distance
        print(f"[VERIFY] user={user_id} similarity={similarity:.4f}")

        if similarity >= VERIFICATION_THRESHOLD:
            return True, f"User {user_id} verified. (Similarity: {similarity:.4f})"
        else:
            return False, f"Verification failed. (Similarity: {similarity:.4f})"

    except Exception as e:
        traceback.print_exc()
        return False, f"Verification error: {e}"
