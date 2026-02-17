from models.evaluate import evaluate_answer
from reports.report_builder import build_report
from utils.model_io import load_model

# Load model
vectorizer = load_model("models/vectorizer.joblib")

# Sample input
question = "Why is teamwork important in the workplace?"
ideal = "Teamwork improves collaboration, productivity, and communication."
user = "Teamwork helps people work together and communicate better."

# Evaluation
scores = evaluate_answer(user, ideal, vectorizer)

# Report
report = build_report(question, user, scores)

print(report)
