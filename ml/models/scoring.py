def final_score(similarity, keyword_score):
    """
    Weighted scoring system
    """
    score = (
        0.7 * similarity +
        0.3 * keyword_score
    )

    return round(score, 2)
