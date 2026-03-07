from sklearn.feature_extraction.text import TfidfVectorizer

def build_vectorizer(corpus):
    vectorizer = TfidfVectorizer(
        max_features=3000,      # controls memory
        ngram_range=(1, 2),     # better context
        min_df=2                # remove rare noise
    )

    vectors = vectorizer.fit_transform(corpus)
    return vectorizer, vectors
