from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional

from .services.biobert_infer import BioBERTInferenceService


class AnalyzeRequest(BaseModel):
    symptoms: str = Field(..., description="Free-text symptom description")
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, description="Male/Female/Other")


class Prediction(BaseModel):
    disease: str
    confidence: float
    treatment: str


class AnalyzeResponse(BaseModel):
    predictions: List[Prediction]
    next_step: str


app = FastAPI(title="BioBERT Symptom Checker API", version="0.3.0")


@app.get("/")
async def root():
    return {"status": "ok", "service": "biobert-symptom-checker"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    service = BioBERTInferenceService.get_instance()
    preds = service.predict_with_confidence(req.symptoms, top_k=3)
    next_step = service.map_next_step(req.symptoms, age=req.age, gender=req.gender)
    
    return AnalyzeResponse(
        predictions=[
            Prediction(disease=disease, confidence=confidence, treatment=treatment) 
            for disease, confidence, treatment in preds
        ],
        next_step=next_step,
    )


@app.get("/health")
async def health():
    try:
        service = BioBERTInferenceService.get_instance()
        return {"status": "healthy", "model_loaded": True}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
