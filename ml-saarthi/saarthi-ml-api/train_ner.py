import pandas as pd
import spacy
from spacy.tokens import DocBin, Doc
from sklearn.model_selection import train_test_split
from spacy.training.iob_utils import iob_to_biluo, tags_to_entities
import os
import warnings

print("--- Starting NER Data Preparation (v5 - Final Fix) ---")

# --- 1. Load Data ---
file_path = "saarthi_ner_augmented.csv"
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"Error: Data file not found at {file_path}")
    exit()
print(f"Loaded {len(df)} token entries.")

# --- 2. Group by Sentence ---
grouped = df.groupby('sentence').agg(list).reset_index()
grouped.rename(columns={'token': 'tokens', 'label': 'tags'}, inplace=True)
print(f"Grouped into {len(grouped)} sentences.")

# --- 3. Split data ---
train_data, test_data = train_test_split(grouped, test_size=0.2, random_state=42)
print(f"Training on {len(train_data)} sentences, testing on {len(test_data)} sentences.\n")

# --- 4. Create Blank SpaCy Model (for vocab) ---
nlp = spacy.blank("xx") 
print("Created blank 'xx' (multi-language) model.")

# --- 5. Helper function to create .spacy files ---
def create_doc_bin(data, file_name):
    print(f"\n--- Processing data for {file_name} ---")
    db = DocBin()
    docs_with_ents = 0
    total_docs = 0
    
    warnings.filterwarnings("ignore", category=UserWarning, module="spacy")

    for index, row in data.iterrows():
        tokens = row['tokens']
        tags = row['tags']
        total_docs += 1
        
        try:
            doc = Doc(nlp.vocab, words=tokens)
            biluo_tags = iob_to_biluo(tags)
            entities = tags_to_entities(biluo_tags)
            
            spans = []
            if entities:
                docs_with_ents += 1
            
            # THIS IS THE V5 FIX:
            # The correct order is (label, start_token, end_token)
            for label, start_token, end_token in entities:
                try:
                    # end_token from tags_to_entities is INCLUSIVE
                    # spacy.tokens.Span end index is EXCLUSIVE
                    # So we use end_token + 1
                    span = spacy.tokens.Span(doc, start_token, end_token + 1, label=label)
                    spans.append(span)
                except Exception as e:
                    print(f"    - (ERROR) Failed to create span: {e} for token indices ({start_token}, {end_token})")
            
            doc.ents = spans
            db.add(doc)
            
        except Exception as e:
            print(f"\n--- ERROR PROCESSING ROW {index} ---")
            print(f"Error: {e}")
            print(f"Tokens: {tokens}")
            print(f"Tags: {tags}\n")

    db.to_disk(file_name)
    warnings.filterwarnings("default")
    print(f"--- Finished {file_name} ---")
    print(f"Successfully created {file_name} with {total_docs} total docs.")
    print(f"Found and processed {docs_with_ents} docs WITH entities.")

# --- 6. Create Train and Dev .spacy files ---
data_dir = "data"
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

create_doc_bin(train_data, os.path.join(data_dir, "train.spacy"))
create_doc_bin(test_data, os.path.join(data_dir, "dev.spacy"))

print("\n--- NER Data Preparation Finished ---")