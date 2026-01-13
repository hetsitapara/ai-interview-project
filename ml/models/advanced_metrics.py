from textblob import TextBlob
import re

def analyze_sentiment(text):
    """
    Returns a sentiment score between -1.0 (Negative) and 1.0 (Positive).
    Also returns a label.
    """
    if not text:
        return {"score": 0, "label": "Neutral"}
        
    blob = TextBlob(text)
    score = blob.sentiment.polarity
    
    if score > 0.1:
        label = "Positive"
    elif score < -0.1:
        label = "Negative"
    else:
        label = "Neutral"
        
    return {"score": score, "label": label}

def check_grammar(text):
    """
    Heuristic-based grammar check.
    Checks for:
    - Capitalization at start of sentences.
    - Punctuation at end of sentences.
    """
    if not text:
        return {"score": 0, "issues": ["No answer provided"]}

    issues = []
    sentences = re.split(r'(?<=[.!?]) +', text)
    
    capitalization_errors = 0
    punctuation_errors = 0
    
    for sentence in sentences:
        if not sentence: continue
        
        # Check capitalization
        if sentence[0].islower():
            capitalization_errors += 1
            
        # Check punctuation (if sentence is reasonable length)
        if sentence[-1] not in ['.', '!', '?'] and len(sentence) > 1:
            punctuation_errors += 1

    total_sentences = len(sentences) or 1
    
    # Simple score calculation
    # 100 base, subtract 10 for each error type per sentence
    score = 100 - ((capitalization_errors + punctuation_errors) * 5)
    score = max(0, score) # Floor at 0
    
    if capitalization_errors > 0:
        issues.append(f"{capitalization_errors} sentences missing capitalization.")
    if punctuation_errors > 0:
        issues.append(f"{punctuation_errors} sentences missing punctuation.")
        
    return {"score": score, "issues": issues}

def analyze_pace(text, duration_seconds):
    """
    Calculates Words Per Minute (WPM).
    duration_seconds: Time taken to answer in seconds.
    """
    if not text or not duration_seconds or duration_seconds <= 0:
        return {"wpm": 0, "label": "N/A"}
        
    word_count = len(text.split())
    minutes = duration_seconds / 60
    wpm = word_count / minutes
    
    # Ideal speaking pace is often considered 120-150 wpm
    if wpm < 100:
        label = "Slow"
    elif wpm > 160:
        label = "Fast"
    else:
        label = "Optimal"
        
    return {"wpm": int(wpm), "label": label}
