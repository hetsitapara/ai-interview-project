import sys
import json
import os
import joblib

# Add current directory to path to allow importing modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.evaluate import evaluate_answer
# from utils.model_io import load_model # Assuming this exists or we use joblib directly

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
        
        # Load model once
        model_path = os.path.join(os.path.dirname(__file__), "models/vectorizer.joblib")
        if not os.path.exists(model_path):
             # Fallback for dev/testing if running from different root
             model_path = "ml/models/vectorizer.joblib"
             
        vectorizer = load_model(model_path)

        results = []
        for item in items:
            user_answer = item.get('user_answer', '')
            ideal_answer = item.get('ideal_answer', '')
            
            # Simple fallback if no ideal answer provided (though backend should provide it)
            if not ideal_answer:
                ideal_answer = "Teamwork, collaboration, and clear communication are essential."

            evaluation = evaluate_answer(user_answer, ideal_answer, vectorizer)
            results.append(evaluation)

        # Output JSON to stdout
        print(json.dumps(results))

    except Exception as e:
        # Construct error object
        error_response = {"error": str(e)}
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    batch_evaluate()
