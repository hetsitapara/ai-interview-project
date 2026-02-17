from preprocessing.load_data import load_dataset
from preprocessing.text_cleaning import clean_text
from preprocessing.tokenizer import preprocess_tokens

def preprocess_dataset(csv_path):
    df = load_dataset(csv_path)

    df["clean_question"] = df["question"].apply(clean_text)
    df["clean_answer"] = df["answer"].apply(clean_text)

    df["final_question"] = df["clean_question"].apply(preprocess_tokens)
    df["final_answer"] = df["clean_answer"].apply(preprocess_tokens)

    return df
