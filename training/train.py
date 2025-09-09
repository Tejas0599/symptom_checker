import os
import argparse
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.metrics import accuracy_score, top_k_accuracy_score, classification_report

from app.transformers.embedder import PubMedBERTEmbedder
from training.data_prep import load_and_merge


STRUCT_FEATURES = ["severity", "rural", "gender", "age"]


def build_structured_features(df: pd.DataFrame) -> np.ndarray:
    cols_present = [c for c in STRUCT_FEATURES if c in df.columns]
    if not cols_present:
        return np.zeros((len(df), 0), dtype=float)

    # Separate numeric and categorical
    numeric_cols = [c for c in cols_present if c in ("severity", "age")]
    cat_cols = [c for c in cols_present if c not in numeric_cols]

    numeric_arr = df[numeric_cols].fillna(0.0).astype(float).to_numpy() if numeric_cols else np.zeros((len(df), 0))

    if cat_cols:
        ohe = OneHotEncoder(handle_unknown="ignore", sparse=False)
        cat_arr = ohe.fit_transform(df[cat_cols].fillna("unknown").astype(str))
    else:
        cat_arr = np.zeros((len(df), 0))

    return np.concatenate([numeric_arr, cat_arr], axis=1)


def train_eval(
    train_paths, artifacts_dir: str, test_path: str = None, kfolds: int = 0
) -> None:
    os.makedirs(artifacts_dir, exist_ok=True)

    df = load_and_merge(train_paths, label_column="label", text_column="text")

    texts = df["text"].astype(str).tolist()
    labels = df["label"].astype(str).tolist()

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(labels)

    embedder = PubMedBERTEmbedder.get_instance()

    def embed_dataframe(sub_df: pd.DataFrame) -> np.ndarray:
        text_emb = embedder.embed_texts(sub_df["text"].astype(str).tolist())
        struct_emb = build_structured_features(sub_df)
        if struct_emb.shape[1] == 0:
            return text_emb
        return np.concatenate([text_emb, struct_emb], axis=1)

    if kfolds and kfolds > 1 and len(np.unique(y)) > 1:
        skf = StratifiedKFold(n_splits=kfolds, shuffle=True, random_state=42)
        accs, topks = [], []
        for train_idx, test_idx in skf.split(np.arange(len(df)), y):
            df_tr = df.iloc[train_idx]
            df_te = df.iloc[test_idx]
            X_tr = embed_dataframe(df_tr)
            X_te = embed_dataframe(df_te)
            y_tr = label_encoder.transform(df_tr["label"].astype(str).tolist())
            y_te = label_encoder.transform(df_te["label"].astype(str).tolist())

            clf = LogisticRegression(max_iter=300, class_weight="balanced", n_jobs=1)
            clf.fit(X_tr, y_tr)

            y_pred = clf.predict(X_te)
            acc = accuracy_score(y_te, y_pred)
            k = min(3, len(label_encoder.classes_))
            try:
                topk = top_k_accuracy_score(y_te, clf.predict_proba(X_te), k=k, labels=list(range(len(label_encoder.classes_))))
            except Exception:
                topk = acc
            accs.append(acc)
            topks.append(topk)
        print({"cv_accuracy_mean": float(np.mean(accs)), "cv_top3_mean": float(np.mean(topks))})

    # Holdout or provided test
    if test_path and os.path.exists(test_path):
        df_train = df
        df_test = load_and_merge([test_path], label_column="label", text_column="text")
    else:
        # Use a robust split without stratify for minimal data
        df_train, df_test = train_test_split(df, test_size=0.2, random_state=42)

    X_train = embed_dataframe(df_train)
    X_test = embed_dataframe(df_test)

    y_train = label_encoder.transform(df_train["label"].astype(str).tolist())
    y_test = label_encoder.transform(df_test["label"].astype(str).tolist())

    clf = LogisticRegression(max_iter=300, class_weight="balanced", n_jobs=1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    k = min(3, len(label_encoder.classes_))
    try:
        topk = top_k_accuracy_score(y_test, clf.predict_proba(X_test), k=k, labels=list(range(len(label_encoder.classes_))))
    except Exception:
        topk = acc

    print({"accuracy": acc, "top3": topk})
    print(
        classification_report(
            y_test,
            y_pred,
            labels=list(range(len(label_encoder.classes_))),
            target_names=label_encoder.classes_,
            zero_division=0,
        )
    )

    joblib.dump(clf, os.path.join(artifacts_dir, "classifier.joblib"))
    joblib.dump(list(label_encoder.classes_), os.path.join(artifacts_dir, "labels.joblib"))
    print(f"Saved artifacts to {artifacts_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", nargs="+", default=[os.path.join("training", "seed_dataset.csv")], help="One or more CSV paths")
    parser.add_argument("--test_data", default=None, help="Optional separate test CSV")
    parser.add_argument("--artifacts", default=os.path.join("artifacts"))
    parser.add_argument("--kfolds", type=int, default=0, help="K-fold CV folds (0 or 1 to skip)")
    args = parser.parse_args()

    train_eval(args.data, args.artifacts, test_path=args.test_data, kfolds=args.kfolds)
