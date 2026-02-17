import sys
import json
import os
import joblib # type: ignore

# Add current directory to path to allow importing modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Imports moved inside batch_evaluate to catch usage errors
# from models.evaluate import evaluate_answer
# from models.advanced_metrics import analyze_sentiment, check_grammar, analyze_pace

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
            duration = item.get('timeTaken', 0) # Assumes timeTaken is passed in input now
            if not duration:
                # Try to cast strings if sent as strings, or default to 0
                 try:
                     duration = float(item.get('timeTaken', 0))
                 except:
                     duration = 0

            # Simple fallback if no ideal answer provided (though backend should provide it)
            if not ideal_answer:
                ideal_answer = "Teamwork, collaboration, and clear communication are essential."

            # 1. Relevance Score (40%)
            # vectors similarity + keyword coverage
            eval_metrics = evaluate_answer(user_answer, ideal_answer, vectorizer)
            relevance_score = eval_metrics.get('final_score', 0) # Already 0-10 from evaluate.py (usually)
            # Ensure it's 0-10
            relevance_score = max(0, min(10, relevance_score))

            # 2. Communication Score (30%)
            # Grammar (0-100) -> 0-10
            grammar_res = check_grammar(user_answer)
            grammar_score = grammar_res.get('score', 0) / 10.0
            
            # Sentiment (-1 to 1) -> mapped to 0-10 for "positivity/enthusiasm"
            # We assume generally positive/neutral is better than negative for interview
            sentiment_res = analyze_sentiment(user_answer)
            sentiment_val = sentiment_res.get('score', 0)
            # Map -1..1 to 0..10: (val + 1) * 5
            sentiment_score = (sentiment_val + 1) * 5
            
            communication_score = (grammar_score * 0.7) + (sentiment_score * 0.3)
            communication_score = max(0, min(10, communication_score))

            # 3. Confidence Score (20%)
            # Based on Pace (WPM)
            pace_res = analyze_pace(user_answer, duration)
            wpm = pace_res.get('wpm', 0)
            
            # Scoring Rule for WPM:
            # Optimal: 100-160 -> 10
            # Acceptable: 80-100 or 160-180 -> 8
            # Poor: < 80 or > 180 -> scaled down
            if 100 <= wpm <= 160:
                confidence_score = 10
            elif 80 <= wpm < 100 or 160 < wpm <= 180:
                confidence_score = 8
            elif wpm < 80:
                # Linear drop from 80wpm(8) to 0wpm(0)
                confidence_score = max(0, wpm / 10) 
            else: # wpm > 180
                # Penalty for too fast
                confidence_score = max(0, 10 - ((wpm - 180) / 10))
            
            confidence_score = max(0, min(10, confidence_score))

            # 4. Response Time Score (10%)
            # Assumed handled by frontend or logic, but we can score it if passed
            # Ideal: 2-30s start delay? 
            # Note: 'duration' here usually means total speaking time, not delay.
            # If we don't have start delay, we might just assume full points or skip.
            # user request says: "Response Time Score... How fast candidate answers"
            # The current 'timeTaken' is likely total duration.
            # Let's derive a proxy or just give a standard score if we lack "latency" metadata.
            # If duration is very short (< 3s) for a long answer, it's suspicious?
            # Let's just give a high baseline for now unless we track latency separately.
            response_time_score = 8.5 # Neutral-High default

            # Final Weighted Score
            final_weighted = (
                (relevance_score * 0.40) +
                (communication_score * 0.30) +
                (confidence_score * 0.20) +
                (response_time_score * 0.10)
            )
            
            # --- PENALTY LOGIC ---
            # 1. Relevance Gate: If answer is completely irrelevant, other metrics don't matter.
            if relevance_score < 2.5:
                # Cap the final score at the relevance score
                final_weighted = min(final_weighted, relevance_score)

            # 2. Gibberish / Keyboard Mash Detection
            # Check for lack of spaces in long input (e.g. "asdfasdfasdf")
            stripped_ans = user_answer.strip()
            if len(stripped_ans) > 15 and ' ' not in stripped_ans:
                final_weighted = 0
                relevance_score = 0
                communication_score = 0

            final_weighted = round(max(0, min(10, final_weighted)), 1)
            
            evaluation = {
                "question": item.get('question', ''), # Pass through if needed
                "userAnswer": user_answer,
                "idealAnswer": ideal_answer,
                "final_score": final_weighted,
                
                # Breakdown
                "relevance_score": round(relevance_score, 1),
                "communication_score": round(communication_score, 1),
                "confidence_score": round(confidence_score, 1),
                "response_time_score": round(response_time_score, 1),
                
                # Raw Metrics for UI
                "wpm": wpm,
                "sentiment_label": sentiment_res.get('label', 'Neutral'),
                "grammar_issues": grammar_res.get('issues', []),
                
                # Legacy support
                "similarity_score": eval_metrics.get('similarity_score', 0),
                "keyword_score": eval_metrics.get('keyword_score', 0),
                "feedback": "Good answer." if final_weighted > 7 else "Identify areas for improvement.", # dynamic feedback later
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
