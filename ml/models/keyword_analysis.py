def keyword_coverage(user_text, reference_text):
    ref_keywords = set(reference_text.split())
    user_words = set(user_text.split())

    matched = ref_keywords.intersection(user_words)
    
    if len(ref_keywords) == 0:
        return 100.0 if not user_words else 0.0 # If both empty, perfect match? Or just 0? Let's say 0 to be safe unless exact match logic handles it elsewhere.
        # Actually for Yes/No, if ideal is "Yes", and cleaning removes it (unlikely), valid comparison fails.
        # But simply avoiding crash is priority.
        if len(user_words) == 0: return 100.0
        return 0.0

    coverage = len(matched) / len(ref_keywords) * 100

    return coverage
