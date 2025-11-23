import faiss
import pickle
import json
import os
from sentence_transformers import SentenceTransformer

def build_rag():
    # 1. Get the correct folder path based on where THIS script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, "faq_data.json")
    index_path = os.path.join(current_dir, "faq.index")
    pkl_path = os.path.join(current_dir, "faq_answers.pkl")

    print(f"🔹 Loading data from: {json_path}")

    # 2. Load data from JSON
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            faq_data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: faq_data.json not found!")
        return

    print(f"🔹 Found {len(faq_data)} questions. Generating AI model...")

    # 3. Create Embeddings
    model = SentenceTransformer("all-MiniLM-L6-v2")
    questions = [item["question"] for item in faq_data]
    embeddings = model.encode(questions, convert_to_numpy=True)

    # 4. Create FAISS Index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    # 5. Save Index and Data
    faiss.write_index(index, index_path)
    with open(pkl_path, "wb") as f:
        pickle.dump(faq_data, f)

    print("✅ Success! Database rebuilt.")

if __name__ == "__main__":
    build_rag()