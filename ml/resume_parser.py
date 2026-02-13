import sys
import json
import os
import pdfplumber
import re

# Categories from DB
CATEGORIES = [
    'DBMS', 'DSA', 'HR', 'Java', 'JavaScript', 'Python', 'React', 'WebDev'
]

# Mapping common terms to categories and topics for better matching
TOPIC_KEYWORDS = {
    # DBMS
    "sql": ("DBMS", "SQL"),
    "database": ("DBMS", "Database"),
    "normalization": ("DBMS", "Normalization"),
    "acid": ("DBMS", "ACID Properties"),
    "nosql": ("DBMS", "NoSQL"),
    "mongodb": ("DBMS", "NoSQL"),
    "postgresql": ("DBMS", "SQL"),
    "mysql": ("DBMS", "SQL"),
    "queries": ("DBMS", "SQL"),
    
    # JS
    "javascript": ("JavaScript", "Basics"),
    "js": ("JavaScript", "Basics"),
    "closure": ("JavaScript", "Closures"),
    "async": ("JavaScript", "Async/Await"),
    "promise": ("JavaScript", "Async"),
    "event loop": ("JavaScript", "Event Loop"),
    "es6": ("JavaScript", "ES6+"),
    "dom": ("JavaScript", "Basics"),
    
    # React
    "react": ("React", "Core"),
    "hooks": ("React", "Hooks"),
    "redux": ("React", "Redux"),
    "context api": ("React", "Context API"),
    "virtual dom": ("React", "Virtual DOM"),
    "component": ("React", "Core"),
    
    # Python
    "python": ("Python", "Basics"),
    "django": ("Python", "Flask/Django Basics"),
    "flask": ("Python", "Flask/Django Basics"),
    "decorator": ("Python", "Decorators"),
    "numpy": ("Python", "Basics"),
    "pandas": ("Python", "Basics"),
    
    # Java
    "java": ("Java", "Basics"),
    "spring": ("Java", "Spring Boot"),
    "hibernate": ("Java", "Hibernate"),
    "jvm": ("Java", "JVM Architecture"),
    "maven": ("Java", "Basics"),
    
    # WebDev
    "html": ("WebDev", "HTML5 Semantic Tags"),
    "css": ("WebDev", "Responsive Design"),
    "flexbox": ("WebDev", "CSS Flexbox/Grid"),
    "grid": ("WebDev", "CSS Flexbox/Grid"),
    "rest": ("WebDev", "REST APIs"),
    "api": ("WebDev", "REST APIs"),
    "frontend": ("WebDev", "Basics"),
    "backend": ("WebDev", "Basics"),
    
    # DSA
    "array": ("DSA", "Arrays"),
    "linked list": ("DSA", "Linked List"),
    "tree": ("DSA", "Trees"),
    "graph": ("DSA", "Graphs"),
    "stack": ("DSA", "Stacks"),
    "queue": ("DSA", "Queues"),
    "sorting": ("DSA", "Sorting/Searching"),
    "algorithm": ("DSA", "Basics"),
    "binary search": ("DSA", "Sorting/Searching"),
    "hashing": ("DSA", "Basics"),
    "complexity": ("DSA", "Basics")
}

# Validation keywords - searching for standard resume sections
MANDATORY_SECTIONS = [
    r"education", 
    r"experience", 
    r"work\s*history", 
    r"employment", 
    r"skills", 
    r"projects", 
    r"objective", 
    r"professional\s*summary", 
    r"profile", 
    r"contact",
    r"certification",
    r"academic",
    r"achievements",
    r"internship",
    r"technical\s*skills",
    r"languages",
    r"hobbies"
]

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        return ""
    return text

def validate_resume(text):
    text_lower = text.lower()
    
    if not text or len(text.strip()) < 100:
        return False, "Document is too short or text could not be extracted properly."
    
    # Check for contact info pattern (optional but strong indicator)
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    has_email = bool(re.search(email_pattern, text_lower))
    
    # Check for mandatory resume sections
    found_sections = []
    for section in MANDATORY_SECTIONS:
        if re.search(section, text_lower):
            found_sections.append(section)
    
    # A valid resume should have at least 2 of these sections OR email + 1 section
    if len(found_sections) < 2 and not (has_email and len(found_sections) >= 1):
        return False, "Document analysis failed. Please ensure you are uploading a standard Resume or CV containing sections like Education, Experience, or Skills."
        
    return True, ""

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No file path provided"}))
            sys.exit(1)
            
        pdf_path = sys.argv[1]
        
        if not os.path.exists(pdf_path):
            print(json.dumps({"error": f"File not found: {pdf_path}"}))
            sys.exit(1)
            
        resume_text = extract_text_from_pdf(pdf_path)
        
        is_valid, error_msg = validate_resume(resume_text)
        if not is_valid:
            print(json.dumps({"error": error_msg}))
            sys.exit(0) 
            
        text_lower = resume_text.lower().replace("\n", " ")
        
        detected_categories = set()
        detected_topics = set()
        
        # 1. Direct Category Match
        for cat in CATEGORIES:
            # Match whole words to avoid partial matching (e.g. 'Java' inside 'Javascript' handled by order)
            # We check JavaScript before Java
            if re.search(rf"\b{re.escape(cat.lower())}\b", text_lower):
                detected_categories.add(cat)
                
        # 2. Keyword-based Topic and Category discovery
        for keyword, (cat, topic) in TOPIC_KEYWORDS.items():
            if re.search(rf"\b{re.escape(keyword)}\b", text_lower):
                detected_categories.add(cat)
                detected_topics.add(topic)
        
        # Always include HR for mixed rounding
        detected_categories.add("HR")
        
        # Prepare response
        result = {
            "success": True,
            "categories": list(detected_categories),
            "topics": list(detected_topics),
            "detected_skills_count": len(detected_topics)
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"Internal Analysis Error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
