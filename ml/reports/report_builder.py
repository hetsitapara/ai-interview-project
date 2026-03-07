from datetime import datetime
from reports.feedback_generator import generate_feedback

def build_report(question, user_answer, scores):
    feedback = generate_feedback(
        scores["similarity_score"],
        scores["keyword_score"],
        scores["final_score"]
    )

    report = {
        "question": question,
        "submitted_answer": user_answer,
        "scores": {
            "similarity": scores["similarity_score"],
            "keyword_coverage": scores["keyword_score"],
            "final_score": scores["final_score"]
        },
        "feedback": feedback,
        "generated_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    return report
