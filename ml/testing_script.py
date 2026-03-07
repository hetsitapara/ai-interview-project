from main_preprocess import preprocess_dataset
from preprocessing.vectorizer import build_vectorizer

df = preprocess_dataset("data/hr_interview.csv")

vectorizer, vectors = build_vectorizer(df["final_answer"])

print("Data processed successfully")
print("Vector shape:", vectors.shape)
