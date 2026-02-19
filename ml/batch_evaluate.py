import sys
import json
import os
import joblib # type: ignore

# Add current directory to path to allow importing modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def load_model(path):
    return joblib.load(path)

def batch_evaluate():
    try:
        # Read from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return

        items = json.loads(input_data)
        
        # Lazy imports to catch errors
        from models.evaluate import evaluate_answer
        from models.advanced_metrics import analyze_sentiment, check_grammar, analyze_pace
        model_path = os.path.join(os.path.dirname(__file__), "models/vectorizer.joblib")
        if not os.path.exists(model_path):
             # Fallback for dev/testing if running from different root
             model_path = "ml/models/vectorizer.joblib"
             
        vectorizer = load_model(model_path)

        results = []
        for item in items:
            user_answer = item.get('user_answer', '')
            ideal_answer = item.get('ideal_answer', '')
            duration = item.get('timeTaken', 0) 
            
            if not duration:
                 try:
                     duration = float(item.get('timeTaken', 0))
                 except:
                     duration = 0

            # Simple fallback if no ideal answer provided
            if not ideal_answer:
                ideal_answer = "Teamwork, collaboration, and clear communication are essential."

            # 1. Relevance Score (40%)
            eval_metrics = evaluate_answer(user_answer, ideal_answer, vectorizer)
            relevance_score = eval_metrics.get('final_score', 0) 
            relevance_score = max(0, min(10, relevance_score))

            # 2. Communication Score (30%)
            grammar_res = check_grammar(user_answer)
            grammar_score = grammar_res.get('score', 0) / 10.0
            
            sentiment_res = analyze_sentiment(user_answer)
            sentiment_val = sentiment_res.get('score', 0)
            sentiment_score = (sentiment_val + 1) * 5
            
            communication_score = (grammar_score * 0.7) + (sentiment_score * 0.3)
            communication_score = max(0, min(10, communication_score))

            # 3. Confidence Score (20%)
            pace_res = analyze_pace(user_answer, duration)
            wpm = pace_res.get('wpm', 0)
            
            if 100 <= wpm <= 160:
                confidence_score = 10
            elif 80 <= wpm < 100 or 160 < wpm <= 180:
                confidence_score = 8
            elif wpm < 80:
                confidence_score = max(0, wpm / 10) 
            else: 
                confidence_score = max(0, 10 - ((wpm - 180) / 10))
            
            confidence_score = max(0, min(10, confidence_score))

            # 4. Response Time Score (10%)
            response_time_score = 8.5 

            # Final Weighted Score
            final_weighted = (
                (relevance_score * 0.40) +
                (communication_score * 0.30) +
                (confidence_score * 0.20) +
                (response_time_score * 0.10)
            )
            
            # --- PENALTY LOGIC ---
            if relevance_score < 2.5:
                final_weighted = min(final_weighted, relevance_score)

            stripped_ans = user_answer.strip()
            if len(stripped_ans) > 15 and ' ' not in stripped_ans:
                final_weighted = 0
                relevance_score = 0
                communication_score = 0

            final_weighted = round(max(0, min(10, final_weighted)), 1)
            
            evaluation = {
                "question": item.get('question', ''),
                "userAnswer": user_answer,
                "idealAnswer": ideal_answer,
                "final_score": final_weighted,
                
                "relevance_score": round(relevance_score, 1),
                "communication_score": round(communication_score, 1),
                "confidence_score": round(confidence_score, 1),
                "response_time_score": round(response_time_score, 1),
                
                "wpm": wpm,
                "sentiment_label": sentiment_res.get('label', 'Neutral'),
                "grammar_issues": grammar_res.get('issues', []),
                
                "similarity_score": eval_metrics.get('similarity_score', 0),
                "keyword_score": eval_metrics.get('keyword_score', 0),
                "feedback": "Good answer." if final_weighted > 7 else "Identify areas for improvement.",
                "sentiment": sentiment_res,
                "grammar": grammar_res,
                "pace": pace_res
            }
            
            results.append(evaluation)

        # Output JSON to stdout
        print(json.dumps(results))

    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    batch_evaluate()
