def generate_feedback(similarity, keyword, final_score):
    feedback = []

    # Similarity feedback
    if similarity >= 80:
        feedback.append("Excellent understanding of the concept.")
    elif similarity >= 60:
        feedback.append("Good understanding, but explanation can be improved.")
    else:
        feedback.append("Answer lacks clarity and depth.")

    # Keyword feedback
    if keyword >= 70:
        feedback.append("Covered most of the important points.")
    else:
        feedback.append("Missed some key concepts. Try to include more relevant points.")

    # Final score feedback
    if final_score >= 75:
        feedback.append("You are interview-ready for this topic.")
    elif final_score >= 50:
        feedback.append("Needs more practice to improve confidence.")
    else:
        feedback.append("Significant improvement is required.")

    return feedback
