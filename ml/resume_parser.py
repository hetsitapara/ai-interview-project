import sys
import json
import os
import random
import pdfplumber
import pandas as pd

# Define keywords mapping to CSV files
KEYWORD_MAPPING = {
    "java": "java_interview_dataset_20_proper.csv",
    "heap": "java_interview_dataset_20_proper.csv",
    "spring": "java_interview_dataset_20_proper.csv",
    
    "python": "python_interview_dataset_20_proper.csv",
    "pandas": "python_interview_dataset_20_proper.csv",
    "django": "python_interview_dataset_20_proper.csv",
    "flask": "python_interview_dataset_20_proper.csv",
    
    "machine learning": "ml_interview_dataset_20_proper.csv",
    "neural network": "ml_interview_dataset_20_proper.csv",
    "deep learning": "ml_interview_dataset_20_proper.csv",
    "nlp": "ml_interview_dataset_20_proper.csv",
    
    "sql": "dbms_interview_dataset_20_proper.csv",
    "database": "dbms_interview_dataset_20_proper.csv",
    "dbms": "dbms_interview_dataset_20_proper.csv",
    
    "operating system": "os_interview_dataset_20_proper.csv",
    "linux": "os_interview_dataset_20_proper.csv",
    "deadlock": "os_interview_dataset_20_proper.csv",
}

DEFAULT_CSV = "hr_interview.csv"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text.lower() + " "
    except Exception as e:
        # If error reading PDF, return empty to fallback
        return ""
    return text

def load_questions_from_csv(filename, count=2):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return []
    
    try:
        df = pd.read_csv(filepath)
        # Ensure we have required columns
        if 'question' not in df.columns or 'answer' not in df.columns:
            return []
            
        questions = df.sample(min(len(df), count)).to_dict('records')
        # Add basic ID if missing (for frontend key)
        for i, q in enumerate(questions):
            q['_id'] = f"{filename}_{i}_{random.randint(1000,9999)}"
        return questions
    except Exception:
        return []

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    resume_text = extract_text_from_pdf(pdf_path)
    
    matched_files = set()
    
    # Identify skills
    for keyword, filename in KEYWORD_MAPPING.items():
        if keyword in resume_text:
            matched_files.add(filename)
            
    final_questions = []
    
    if not matched_files:
        # Fallback to HR if no technical skills found
        matched_files.add(DEFAULT_CSV)
        
    # Load questions from matched topics
    # We want around 10 questions total
    questions_per_topic = max(2, 10 // len(matched_files))
    
    for filename in matched_files:
        final_questions.extend(load_questions_from_csv(filename, questions_per_topic))
        
    # Shuffle and trim to 10
    random.shuffle(final_questions)
    final_questions = final_questions[:10]
    
    print(json.dumps(final_questions))

if __name__ == "__main__":
    main()
