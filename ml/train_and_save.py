from main_preprocess import preprocess_dataset
from preprocessing.vectorizer import build_vectorizer
from utils.model_io import save_model

# Load & preprocess dataset
df = preprocess_dataset("data/hr_interview.csv")

# Train vectorizer
vectorizer, _ = build_vectorizer(df["final_answer"])

# Save vectorizer
save_model(vectorizer, "models/vectorizer.joblib")

print("Vectorizer saved successfully")
