def keyword_coverage(user_text, reference_text):
    ref_keywords = set(reference_text.split())
    user_words = set(user_text.split())

    matched = ref_keywords.intersection(user_words)
    coverage = len(matched) / len(ref_keywords) * 100

    return coverage
