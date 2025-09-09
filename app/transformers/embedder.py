from __future__ import annotations

from typing import List, Optional
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel


_MODEL_NAME = "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext"


def _mean_pool(last_hidden_state: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
    mask = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
    masked = last_hidden_state * mask
    summed = torch.sum(masked, dim=1)
    counts = torch.clamp(mask.sum(dim=1), min=1e-9)
    return summed / counts


class PubMedBERTEmbedder:
    _instance: Optional["PubMedBERTEmbedder"] = None

    def __init__(self, model_name: str = _MODEL_NAME, device: Optional[str] = None) -> None:
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.to(self.device)
        self.model.eval()

    @classmethod
    def get_instance(cls) -> "PubMedBERTEmbedder":
        if cls._instance is None:
            cls._instance = PubMedBERTEmbedder()
        return cls._instance

    def embed_texts(self, texts: List[str], max_length: int = 128) -> np.ndarray:
        with torch.no_grad():
            batch = self.tokenizer(
                texts,
                padding=True,
                truncation=True,
                max_length=max_length,
                return_tensors="pt",
            )
            batch = {k: v.to(self.device) for k, v in batch.items()}
            outputs = self.model(**batch)
            pooled = _mean_pool(outputs.last_hidden_state, batch["attention_mask"])  # (B, D)
            return pooled.cpu().numpy()
