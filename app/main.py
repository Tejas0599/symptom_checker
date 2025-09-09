from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional

from .services.infer import InferenceService


class AnalyzeRequest(BaseModel):
    symptoms: str = Field(..., description="Free-text symptom description")
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, description="Male/Female/Other")


class AnalyzeResponse(BaseModel):
    possible_conditions: List[str]
    next_step: str


app = FastAPI(title="Symptom Checker API", version="0.1.0")


@app.get("/")
async def root():
    return {"status": "ok", "service": "symptom-checker"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    service = InferenceService.get_instance()
    conditions = service.predict_conditions(req.symptoms, top_k=3)
    next_step = service.map_next_step(req.symptoms, age=req.age, gender=req.gender)
    return AnalyzeResponse(possible_conditions=conditions, next_step=next_step)
