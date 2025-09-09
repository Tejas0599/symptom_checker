from __future__ import annotations

from typing import List, Optional, Tuple, Dict
import os
import joblib
import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from ..triage.rules import map_triage


class BioBERTInferenceService:
    _instance: Optional["BioBERTInferenceService"] = None

    def __init__(self) -> None:
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load model and tokenizer
        model_path = os.environ.get("MODEL_PATH", os.path.join(os.path.dirname(__file__), "..", "..", "models", "symptom_disease_model"))
        if not os.path.exists(model_path):
            raise RuntimeError(f"Model not found at {model_path}. Please copy your trained model there.")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
        self.model.to(self.device)
        self.model.eval()
        
        # Load label encoder
        label_encoder_path = os.path.join(model_path, "label_encoder.pkl")
        if not os.path.exists(label_encoder_path):
            # Fallback to models directory
            label_encoder_path = os.path.join(os.path.dirname(__file__), "..", "..", "models", "label_encoder.pkl")
        
        if not os.path.exists(label_encoder_path):
            raise RuntimeError(f"Label encoder not found at {label_encoder_path}")
        
        self.label_encoder = joblib.load(label_encoder_path)
        
        # Load treatment mapping
        self.treatment_map = self._load_treatment_mapping()

    @classmethod
    def get_instance(cls) -> "BioBERTInferenceService":
        if cls._instance is None:
            cls._instance = BioBERTInferenceService()
        return cls._instance

    def _load_treatment_mapping(self) -> Dict[str, str]:
        """Load treatment mapping from the dataset"""
        dataset_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "Symptom2Disease.csv")
        if not os.path.exists(dataset_path):
            return {}
        
        df = pd.read_csv(dataset_path)
        # Create disease -> treatment mapping (take first non-empty treatment for each disease)
        treatment_map = {}
        for disease in df['Disease'].unique():
            treatments = df[df['Disease'] == disease]['Treatments'].dropna()
            treatments = treatments[treatments != '']
            if len(treatments) > 0:
                treatment_map[disease] = treatments.iloc[0]
            else:
                treatment_map[disease] = "Consult a healthcare provider for treatment recommendations"
        
        return treatment_map

    def predict_with_confidence(self, text: str, top_k: int = 3) -> List[Tuple[str, float, str]]:
        """Predict disease with confidence and treatment recommendation"""
        with torch.no_grad():
            # Tokenize
            inputs = self.tokenizer(
                text,
                truncation=True,
                padding=True,
                max_length=256,
                return_tensors="pt"
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Predict
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)
            
            # Get top-k predictions
            top_probs, top_indices = torch.topk(probabilities, k=min(top_k, len(self.label_encoder.classes_)))
            
            results = []
            for prob, idx in zip(top_probs[0], top_indices[0]):
                disease = self.label_encoder.classes_[idx.item()]
                confidence = prob.item()
                treatment = self.treatment_map.get(disease, "Consult a healthcare provider for treatment recommendations")
                results.append((disease, confidence, treatment))
            
            return results

    def predict_conditions(self, text: str, top_k: int = 3) -> List[str]:
        """Get just the disease names"""
        return [disease for disease, _, _ in self.predict_with_confidence(text, top_k=top_k)]

    def map_next_step(self, text: str, age: Optional[int] = None, gender: Optional[str] = None) -> str:
        """Map symptoms to next step recommendation"""
        return map_triage(text, age=age, gender=gender)
