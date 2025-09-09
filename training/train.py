import os
import argparse
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, top_k_accuracy_score, classification_report

from app.transformers.embedder import PubMedBERTEmbedder


def train_model(input_csv: str, artifacts_dir: str) -> None:
    os.makedirs(artifacts_dir, exist_ok=True)
    df = pd.read_csv(input_csv)
    texts = df["text"].astype(str).tolist()
    labels = df["label"].astype(str).tolist()

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(labels)

    # Use stratify only if every class has at least 2 samples
    label_counts = pd.Series(labels).value_counts()
    can_stratify = (label_counts.min() >= 2) and (len(label_counts) > 1)

    X_train_texts, X_test_texts, y_train, y_test = train_test_split(
        texts,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y if can_stratify else None,
    )

    embedder = PubMedBERTEmbedder.get_instance()
    X_train = embedder.embed_texts(X_train_texts)
    X_test = embedder.embed_texts(X_test_texts)

    clf = LogisticRegression(max_iter=200, n_jobs=1, verbose=0)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    # Top-3 accuracy (guard for rare case where classes < 3)
    num_classes = len(label_encoder.classes_)
    k = min(3, num_classes)
    try:
        proba = clf.predict_proba(X_test)
        topk = top_k_accuracy_score(y_test, proba, k=k, labels=list(range(num_classes)))
    except Exception:
        topk = acc

    print({"accuracy": acc, "topk": topk})
    # Ensure report covers all fitted classes even if absent in y_test
    print(
        classification_report(
            y_test,
            y_pred,
            labels=list(range(num_classes)),
            target_names=label_encoder.classes_,
            zero_division=0,
        )
    )

    joblib.dump(clf, os.path.join(artifacts_dir, "classifier.joblib"))
    joblib.dump(list(label_encoder.classes_), os.path.join(artifacts_dir, "labels.joblib"))
    print(f"Saved artifacts to {artifacts_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default=os.path.join("training", "seed_dataset.csv"))
    parser.add_argument("--artifacts", default=os.path.join("artifacts"))
    args = parser.parse_args()

    train_model(args.data, args.artifacts)
