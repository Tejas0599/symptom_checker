from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import asyncio

from .services.biobert_infer import BioBERTInferenceService
from .services.voice_analysis import VoiceAnalysisService


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

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.post("/analyze-voice")
async def analyze_voice(
    audio: Optional[UploadFile] = File(None, description="Audio file (WAV, MP3, etc.)"),
    audio_url: Optional[str] = Form(None, description="Supabase URL of audio file"),
    language: str = Form(default="en", description="Language code (en/hi)"),
    age: Optional[int] = Form(None, ge=0, le=120, description="User age"),
    gender: Optional[str] = Form(None, description="User gender")
):
    """
    Analyze symptoms from voice input
    
    - **audio**: Audio file containing voice input (either this or audio_url required)
    - **audio_url**: Supabase URL of audio file (either this or audio required)
    - **language**: Language code ("en" for English, "hi" for Hindi)
    - **age**: Optional user age
    - **gender**: Optional user gender
    """
    try:
        audio_data = None
        
        if audio_url:
            # Download from Supabase URL
            import requests
            try:
                response = requests.get(audio_url, timeout=30)
                response.raise_for_status()
                audio_data = response.content
                print(f"Downloaded audio from Supabase: {len(audio_data)} bytes")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to download audio from URL: {str(e)}")
        elif audio:
            # Read uploaded file
            if not audio.content_type.startswith('audio/'):
                raise HTTPException(status_code=400, detail="File must be an audio file")
            
            audio_data = await audio.read()
            if len(audio_data) == 0:
                raise HTTPException(status_code=400, detail="Empty audio file")
        else:
            raise HTTPException(status_code=400, detail="Either audio file or audio_url must be provided")
        
        # Prepare user info
        user_info = {}
        if age is not None:
            user_info["age"] = age
        if gender is not None:
            user_info["gender"] = gender
        
        # Analyze voice
        voice_service = VoiceAnalysisService.get_instance()
        result = await voice_service.analyze_voice_symptoms(
            audio_data, 
            language=language, 
            user_info=user_info
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")


@app.post("/analyze-voice-batch")
async def analyze_voice_batch(
    audio_files: List[UploadFile] = File(..., description="Multiple audio files"),
    language: str = Form(default="en", description="Language code (en/hi)"),
    age: Optional[int] = Form(None, ge=0, le=120, description="User age"),
    gender: Optional[str] = Form(None, description="User gender")
):
    """
    Analyze symptoms from multiple voice inputs
    
    - **audio_files**: Multiple audio files containing voice input
    - **language**: Language code ("en" for English, "hi" for Hindi)
    - **age**: Optional user age
    - **gender**: Optional user gender
    """
    try:
        if len(audio_files) > 10:  # Limit batch size
            raise HTTPException(status_code=400, detail="Maximum 10 files per batch")
        
        # Validate and read audio files
        audio_data_list = []
        for audio in audio_files:
            if not audio.content_type.startswith('audio/'):
                raise HTTPException(status_code=400, detail=f"File {audio.filename} must be an audio file")
            
            data = await audio.read()
            if len(data) == 0:
                raise HTTPException(status_code=400, detail=f"Empty audio file: {audio.filename}")
            
            audio_data_list.append(data)
        
        # Prepare user info
        user_info = {}
        if age is not None:
            user_info["age"] = age
        if gender is not None:
            user_info["gender"] = gender
        
        # Analyze voices in batch
        voice_service = VoiceAnalysisService.get_instance()
        results = await voice_service.batch_analyze(audio_data_list, language=language)
        
        return {
            "success": True,
            "results": results,
            "count": len(results),
            "language": language,
            "user_info": user_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch voice analysis failed: {str(e)}")


@app.get("/health")
async def health():
    try:
        # Check text analysis service
        text_service = BioBERTInferenceService.get_instance()
        text_health = {"status": "healthy", "model_loaded": True}
        
        # Check voice analysis service
        voice_service = VoiceAnalysisService.get_instance()
        voice_health = voice_service.health_check()
        
        overall_healthy = (
            text_health["status"] == "healthy" and 
            voice_health["overall"] == "healthy"
        )
        
        return {
            "status": "healthy" if overall_healthy else "unhealthy",
            "services": {
                "text_analysis": text_health,
                "voice_analysis": voice_health
            },
            "features": {
                "text_analysis": True,
                "voice_analysis": True,
                "multilingual": True,
                "real_time": True
            }
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported languages for voice input"""
    voice_service = VoiceAnalysisService.get_instance()
    return {
        "languages": voice_service.get_supported_languages(),
        "default": "en",
        "note": "Supports English and Hindi voice input"
    }
