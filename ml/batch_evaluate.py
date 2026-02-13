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

            evaluation = evaluate_answer(user_answer, ideal_answer, vectorizer)
            
            # Additional Metrics
            sentiment = analyze_sentiment(user_answer)
            grammar = check_grammar(user_answer)
            pace = analyze_pace(user_answer, duration)
            
            evaluation.update({
                "sentiment": sentiment,
                "grammar": grammar,
                "pace": pace
            })
            
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
