# from main_preprocess import preprocess_dataset
# from preprocessing.vectorizer import build_vectorizer
# from models.evaluate import evaluate_answer

# # 1. Load & preprocess dataset
# df = preprocess_dataset("data/hr_interview.csv")

# # 2. Build vectorizer USING IDEAL ANSWERS
# vectorizer, _ = build_vectorizer(df["final_answer"])

# # 3. Test input
# ideal = "A good answer explains teamwork, collaboration, and communication."
# user = "Teamwork and communication are important while working together."

# # 4. Evaluate
# result = evaluate_answer(user, ideal, vectorizer)

# print(result)
from utils.model_io import load_model
from evaluate import evaluate_answer

# Load trained vectorizer
vectorizer = load_model("models/vectorizer.joblib")

ideal = "A good answer explains teamwork, collaboration, and communication."
user = "Teamwork and communication are important while working together."

result = evaluate_answer(user, ideal, vectorizer)
print(result)
