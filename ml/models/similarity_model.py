from sklearn.metrics.pairwise import cosine_similarity

def calculate_similarity(user_vector, reference_vector):
    """
    Calculates cosine similarity between
    user answer and reference answer
    """
    similarity = cosine_similarity(user_vector, reference_vector)
    return similarity[0][0] * 100
