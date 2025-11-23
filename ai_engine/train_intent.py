import pandas as pd
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# 1. Load the data
print("Loading data...")
try:
    data = pd.read_csv("intent_data.csv")
except FileNotFoundError:
    print("❌ Error: intent_data.csv not found!")
    exit()

# 2. Prepare Training Data
X = data["text"] # The user's message
y = data["intent"] # The label (what they want)

# 3. Create a Pipeline
# (CountVectorizer turns words into numbers, MultinomialNB classifies them)
model = make_pipeline(CountVectorizer(), MultinomialNB())

# 4. Train the model
print("Training the model...")
model.fit(X, y)

# 5. Test it quickly
test_phrases = ["check balance", "transfer money", "help me with loan"]
print("\n--- TEST RESULTS ---")
for phrase in test_phrases:
    prediction = model.predict([phrase])[0]
    print(f"Input: '{phrase}'  -->  Intent: {prediction}")

# 6. Save the trained model
with open("intent_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("\n✅ Model saved as 'intent_model.pkl'")