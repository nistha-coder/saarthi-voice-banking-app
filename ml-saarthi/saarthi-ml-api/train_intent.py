import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
import os

print("--- Starting Intent Model Training ---")

# --- 1. Load Data ---
file_path = "saarthi_intent_dataset_balanced.csv"
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"Error: Data file not found at {file_path}")
    exit()

print(f"Loaded {len(df)} training examples.")

# --- 2. Define X and y ---
X = df['query']
y = df['intent']

# --- 3. Create Model Pipeline ---
# We will train on ALL the data now, not just a split,
# since this is our final model for production.
model_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
    ('clf', LogisticRegression(random_state=42, max_iter=200))
])

# --- 4. Train the Model ---
print("Training the final model on all data...")
model_pipeline.fit(X, y)
print("Model training complete.")

# --- 5. Save the Model ---
output_dir = "models"
model_path = os.path.join(output_dir, "intent_model.pkl")

# Ensure the 'models' directory exists
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

print(f"Saving model to {model_path}...")
joblib.dump(model_pipeline, model_path)

print("--- Intent Model Training Finished Successfully ---")
print(f"Your model is saved and ready at: {model_path}")