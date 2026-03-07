from preprocessing.text_cleaning import clean_text
from preprocessing.tokenizer import preprocess_tokens
from preprocessing.vectorizer import build_vectorizer
from models.similarity_model import calculate_similarity
from models.keyword_analysis import keyword_coverage
from models.scoring import final_score

def evaluate_answer(user_answer, ideal_answer, vectorizer):
    # Preprocess
    user_clean = preprocess_tokens(clean_text(user_answer))
    ref_clean = preprocess_tokens(clean_text(ideal_answer))

    # Vectorize
    user_vec = vectorizer.transform([user_clean])
    ref_vec = vectorizer.transform([ref_clean])

    # Scores
    similarity = calculate_similarity(user_vec, ref_vec)
    keyword_score = keyword_coverage(user_clean, ref_clean)

    final = final_score(similarity, keyword_score)

    return {
        "similarity_score": round(similarity, 2),
        "keyword_score": round(keyword_score, 2),
        "final_score": final
    }
