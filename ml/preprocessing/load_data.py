import pandas as pd

def load_dataset(path):
    """
    Loads dataset and selects required columns only
    for efficiency.
    """
    df = pd.read_csv(path)

    df = df[[
        "question",
        "answer",
        "topic",
        "difficulty"
    ]]

    df.dropna(inplace=True)
    return df
