import re
from typing import List, Optional
import pandas as pd


def _normalize_text(text: str) -> str:
    t = str(text).lower()
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    # Simple synonym normalization examples
    t = t.replace("loose motions", "diarrhea")
    t = t.replace("gas", "bloating")
    t = t.replace("acidity", "heartburn")
    return t


def load_and_merge(csv_paths: List[str], label_column: str = "label", text_column: str = "text") -> pd.DataFrame:
    frames: List[pd.DataFrame] = []
    for path in csv_paths:
        df = pd.read_csv(path)
        if text_column not in df.columns or label_column not in df.columns:
            raise ValueError(f"File {path} must contain columns: {text_column}, {label_column}")
        frames.append(df[[text_column, label_column] + [c for c in df.columns if c not in {text_column, label_column}]].copy())
    merged = pd.concat(frames, ignore_index=True)

    # Normalize text
    merged[text_column] = merged[text_column].astype(str).map(_normalize_text)

    # Optional structured features
    # If present, we will pass these through to the model builder
    for opt in ["severity", "rural", "gender", "age"]:
        if opt in merged.columns:
            # Coerce numeric where appropriate
            if opt in ("severity", "age"):
                merged[opt] = pd.to_numeric(merged[opt], errors="coerce")
            else:
                merged[opt] = merged[opt].astype(str).str.lower()

    return merged
