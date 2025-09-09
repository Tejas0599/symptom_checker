from __future__ import annotations

from typing import List, Optional, Tuple
import os
import joblib
import numpy as np

from ..transformers.embedder import PubMedBERTEmbedder
from ..triage.rules import map_triage


class InferenceService:
    _instance: Optional["InferenceService"] = None

    def __init__(self) -> None:
        self.embedder = PubMedBERTEmbedder.get_instance()
        artifacts_dir = os.environ.get(
            "ARTIFACTS_DIR",
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts")),
        )
        classifier_path = os.path.abspath(os.path.join(artifacts_dir, "classifier.joblib"))
        labels_path = os.path.abspath(os.path.join(artifacts_dir, "labels.joblib"))
        if not os.path.exists(classifier_path) or not os.path.exists(labels_path):
            raise RuntimeError(
                f"Missing artifacts. Expected classifier at {classifier_path} and labels at {labels_path}. Run training first."
            )
        self.classifier = joblib.load(classifier_path)
        self.labels: List[str] = joblib.load(labels_path)

    @classmethod
    def get_instance(cls) -> "InferenceService":
        if cls._instance is None:
            cls._instance = InferenceService()
        return cls._instance

    def predict_with_confidence(self, text: str, top_k: int = 3) -> List[Tuple[str, float]]:
        embedding = self.embedder.embed_texts([text])  # shape (1, d)
        probs = self._predict_proba(embedding)[0]
        top_indices = np.argsort(probs)[::-1][:top_k]
        return [(self.labels[i], float(probs[i])) for i in top_indices]

    def predict_conditions(self, text: str, top_k: int = 3) -> List[str]:
        return [label for label, _ in self.predict_with_confidence(text, top_k=top_k)]

    def _predict_proba(self, embeddings: np.ndarray) -> np.ndarray:
        if hasattr(self.classifier, "predict_proba"):
            return self.classifier.predict_proba(embeddings)
        scores = self.classifier.decision_function(embeddings)
        exp_scores = np.exp(scores - np.max(scores, axis=1, keepdims=True))
        return exp_scores / np.sum(exp_scores, axis=1, keepdims=True)

    def map_next_step(self, text: str, age: Optional[int] = None, gender: Optional[str] = None) -> str:
        return map_triage(text, age=age, gender=gender)
