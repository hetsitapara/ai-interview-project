import sys
import json
import os
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from textblob import TextBlob

# Initialize Sentence Transformer model
model_name = 'all-MiniLM-L6-v2'
model = SentenceTransformer(model_name)

def check_grammar(text):
    if not text:
        return 0, []
    blob = TextBlob(text)
    # Simple heuristic: grammar score based on basic checks
    # In a real system, we'd use LanguageTool or similar
    score = 1.0
    if len(text) > 0 and text[0].islower():
        score -= 0.1
    if text.strip() and text.strip()[-1] not in ['.', '!', '?']:
        score -= 0.1
    return max(0, score), []

def calculate_hybrid_score(semantic_sim, keyword_score, length_score):
    return (0.6 * semantic_sim) + (0.3 * keyword_score) + (0.1 * length_score)

def calculate_confidence_score(semantic_sim, keyword_score, grammar_score):
    return (0.5 * semantic_sim) + (0.3 * keyword_score) + (0.2 * grammar_score)

def detect_cheating(similarity, userAnswer, duration):
    word_count = len(userAnswer.split())
    
    # 1. Similarity > 0.95 AND very long answer
    if similarity > 0.95 and word_count > 100:
        return True
    
    # 2. Response time < 3 seconds AND long answer
    if duration < 3 and word_count > 20:
        return True
    
    # 3. AI-generated probability (Simplified for this project)
    # In practice, we'd use a specific model. Here we flag if it's too perfect.
    if similarity > 0.98 and word_count > 50:
        return True
        
    return False

def batch_evaluate():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            return

        items = json.loads(input_data)
        results = []

        for item in items:
            question = item.get('question', '')
            user_answer = item.get('user_answer', '')
            ideal_answer = item.get('ideal_answer', '')
            keywords = item.get('keywords', [])
            duration = item.get('timeTaken', 0)

            if not user_answer or user_answer.strip() == "":
                results.append({
                    "question": question,
                    "user_answer": user_answer,
                    "refined_answer": "",
                    "accuracy_score": 0,
                    "confidence_score": 0,
                    "keyword_score": 0,
                    "grammar_score": 0,
                    "cheating_flag": False,
                    "evaluation": "Incorrect",
                    "missing_keywords": keywords,
                    "explanation": "No answer provided."
                })
                continue

            # Semantic Similarity
            embeddings = model.encode([user_answer, ideal_answer])
            semantic_sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            semantic_sim = max(0, min(1, semantic_sim))

            # Keyword Score
            detected_keywords = [k for k in keywords if k.lower() in user_answer.lower()]
            keyword_score = len(detected_keywords) / len(keywords) if keywords else 1.0
            missing_keywords = [k for k in keywords if k not in detected_keywords]

            # Length Score
            user_len = len(user_answer.split())
            ideal_len = len(ideal_answer.split())
            length_score = min(user_len / ideal_len, 1.0) if ideal_len > 0 else 1.0

            # Grammar Score
            grammar_val, _ = check_grammar(user_answer)

            # Accuracy Score
            accuracy = float(calculate_hybrid_score(semantic_sim, keyword_score, length_score))
            
            # Confidence Score
            confidence = float(calculate_confidence_score(semantic_sim, keyword_score, grammar_val))

            # Cheating Detection
            cheating = bool(detect_cheating(semantic_sim, user_answer, duration))

            # Evaluation Label
            if accuracy >= 0.85:
                evaluation = "Excellent"
            elif accuracy >= 0.65:
                evaluation = "Good"
            elif accuracy >= 0.40:
                evaluation = "Partial"
            else:
                evaluation = "Incorrect"

            results.append({
                "question": question,
                "user_answer": user_answer,
                "refined_answer": item.get('refined_answer', ""), # Passed from Node.js
                "accuracy_score": round(accuracy, 2),
                "confidence_score": round(confidence, 2),
                "keyword_score": round(float(keyword_score), 2),
                "grammar_score": round(float(grammar_val), 2),
                "cheating_flag": cheating,
                "evaluation": evaluation,
                "missing_keywords": missing_keywords,
                "explanation": item.get('explanation', ""), # Passed from Node.js
                "final_score": round(accuracy * 10, 1), # For UI consistency with 10-point scale
                "feedback": item.get('explanation', "Good response.")
            })

        print(json.dumps(results))

    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)

if __name__ == "__main__":
    batch_evaluate()
