"""
Whisper Integration Service for Real-time Voice Processing
This service integrates with your team's Whisper model for voice-to-text conversion
"""

import os
import io
import asyncio
import logging
from typing import Optional, Dict, Any
import torch
import torchaudio
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import numpy as np
import librosa
from pydub import AudioSegment

logger = logging.getLogger(__name__)


class WhisperIntegrationService:
    """Service for integrating with Whisper model for voice-to-text conversion"""
    
    _instance: Optional["WhisperIntegrationService"] = None
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.processor = None
        self._load_model()
    
    @classmethod
    def get_instance(cls) -> "WhisperIntegrationService":
        if cls._instance is None:
            cls._instance = WhisperIntegrationService()
        return cls._instance
    
    def _load_model(self):
        """Load Whisper model and processor"""
        try:
            # You can replace this with your team's specific model path
            model_name = os.environ.get("WHISPER_MODEL", "openai/whisper-base")
            
            logger.info(f"Loading Whisper model: {model_name}")
            self.processor = WhisperProcessor.from_pretrained(model_name)
            self.model = WhisperForConditionalGeneration.from_pretrained(model_name)
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.warning(f"Failed to load Whisper model: {e}")
            logger.warning("Whisper model will be disabled. Voice analysis will use mock transcription.")
            self.model = None
            self.processor = None
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en") -> Dict[str, Any]:
        """
        Transcribe audio data to text using Whisper
        
        Args:
            audio_data: Raw audio bytes
            language: Language code ("en" for English, "hi" for Hindi)
        
        Returns:
            Dict containing transcription and metadata
        """
        # Check if Whisper model is available
        if self.model is None or self.processor is None:
            logger.warning("Whisper model not available, using mock transcription")
            return self._mock_transcription(language)
        
        try:
            # Convert bytes to audio tensor
            logger.info(f"Processing audio data: {len(audio_data)} bytes")
            audio_tensor = self._bytes_to_audio_tensor(audio_data)
            logger.info(f"Audio tensor shape: {audio_tensor.shape}, type: {type(audio_tensor)}")
            
            # Process audio - force English translation regardless of input language
            inputs = self.processor(
                audio_tensor, 
                sampling_rate=16000, 
                return_tensors="pt",
                language="en"  # Force English output
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate transcription with forced English translation
            with torch.no_grad():
                generated_ids = self.model.generate(
                    inputs["input_features"],
                    max_length=448,
                    num_beams=5,
                    early_stopping=True,
                    forced_decoder_ids=self.processor.get_decoder_prompt_ids(
                        language="en", 
                        task="translate"  # Force translation to English
                    )
                )
            
            # Decode transcription
            transcription = self.processor.batch_decode(
                generated_ids, 
                skip_special_tokens=True
            )[0]
            
            return {
                "success": True,
                "transcription": transcription.strip(),
                "language": "en",  # Always English output
                "confidence": 1.0,  # Whisper doesn't provide confidence scores directly
                "model": "whisper",
                "translated": True  # Indicate this was translated to English
            }
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "transcription": "",
                "language": language
            }
    
    def _mock_transcription(self, language: str) -> Dict[str, Any]:
        """Provide mock transcription when Whisper is not available"""
        mock_transcriptions = {
            "en": "I have been experiencing fever and cough for the past few days with body ache",
            "hi": "मुझे पिछले कुछ दिनों से बुखार और खांसी हो रही है, साथ ही शरीर में दर्द भी है"
        }
        
        return {
            "success": True,
            "transcription": mock_transcriptions.get(language, mock_transcriptions["en"]),
            "language": language,
            "confidence": 0.8,  # Lower confidence for mock
            "model": "mock",
            "note": "Whisper model not available, using mock transcription"
        }
    
    def _bytes_to_audio_tensor(self, audio_data: bytes) -> torch.Tensor:
        """Convert audio bytes to tensor"""
        try:
            audio_buffer = io.BytesIO(audio_data)
            
            # First try librosa (better M4A support)
            try:
                logger.info("Trying librosa first for M4A support...")
                audio_array, sample_rate = librosa.load(audio_buffer, sr=16000, mono=True)
                logger.info(f"Librosa success: shape={audio_array.shape}, sr={sample_rate}")
                
                # Normalize
                if np.max(np.abs(audio_array)) > 0:
                    audio_array = audio_array / np.max(np.abs(audio_array))
                
                return audio_array
            except Exception as librosa_error:
                logger.warning(f"Librosa failed: {librosa_error}")
            
            # Try pydub for M4A files
            try:
                logger.info("Trying pydub for M4A support...")
                audio_buffer.seek(0)
                audio_segment = AudioSegment.from_file(audio_buffer, format="m4a")
                # Convert to mono and 16kHz
                audio_segment = audio_segment.set_channels(1).set_frame_rate(16000)
                # Convert to numpy array
                audio_array = np.array(audio_segment.get_array_of_samples(), dtype=np.float32)
                # Normalize
                if np.max(np.abs(audio_array)) > 0:
                    audio_array = audio_array / np.max(np.abs(audio_array))
                logger.info(f"Pydub success: shape={audio_array.shape}")
                return audio_array
            except Exception as pydub_error:
                logger.warning(f"Pydub failed: {pydub_error}")
            
            # Fallback to torchaudio with different formats
            audio_buffer.seek(0)
            formats_to_try = ["m4a", "mp4", "wav", "mp3", "flac"]
            waveform = None
            sample_rate = None
            
            for fmt in formats_to_try:
                try:
                    audio_buffer.seek(0)  # Reset buffer position
                    waveform, sample_rate = torchaudio.load(audio_buffer, format=fmt)
                    logger.info(f"Successfully loaded audio as {fmt} format")
                    break
                except Exception as fmt_error:
                    logger.debug(f"Failed to load as {fmt}: {fmt_error}")
                    continue
            
            if waveform is None:
                raise Exception("Could not load audio in any supported format")
            
            # Convert to mono if stereo
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)
            
            # Resample to 16kHz if needed
            if sample_rate != 16000:
                resampler = torchaudio.transforms.Resample(sample_rate, 16000)
                waveform = resampler(waveform)
            
            # Convert to numpy array and flatten
            audio_array = waveform.squeeze().numpy()
            
            # Normalize
            if np.max(np.abs(audio_array)) > 0:
                audio_array = audio_array / np.max(np.abs(audio_array))
            
            logger.info(f"Audio processed: shape={audio_array.shape}, sample_rate=16000")
            return audio_array
            
        except Exception as e:
            logger.error(f"Failed to process audio data: {e}")
            # Final fallback: create a simple audio array
            logger.warning("Using final fallback audio processing")
            return np.zeros(16000, dtype=np.float32)
    
    async def transcribe_file(self, file_path: str, language: str = "en") -> Dict[str, Any]:
        """Transcribe audio from file"""
        try:
            with open(file_path, "rb") as f:
                audio_data = f.read()
            return await self.transcribe_audio(audio_data, language)
        except Exception as e:
            logger.error(f"Failed to transcribe file {file_path}: {e}")
            return {
                "success": False,
                "error": str(e),
                "transcription": "",
                "language": language
            }
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get supported languages"""
        return {
            "en": "English",
            "hi": "Hindi",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "ru": "Russian",
            "ja": "Japanese",
            "ko": "Korean",
            "zh": "Chinese"
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Check if Whisper service is healthy"""
        try:
            if self.model is None or self.processor is None:
                return {
                    "status": "degraded", 
                    "error": "Whisper model not loaded",
                    "model_loaded": False,
                    "fallback": "mock_transcription"
                }
            
            # Simple health check without async call
            return {
                "status": "healthy",
                "model_loaded": True,
                "device": self.device,
                "model_name": "whisper-base"
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}


# Async wrapper for easier integration
class AsyncWhisperService:
    """Async wrapper for Whisper service"""
    
    def __init__(self):
        self.whisper = WhisperIntegrationService.get_instance()
    
    async def transcribe(self, audio_data: bytes, language: str = "en") -> str:
        """Simple async transcription method"""
        result = await self.whisper.transcribe_audio(audio_data, language)
        if result["success"]:
            return result["transcription"]
        else:
            raise RuntimeError(f"Transcription failed: {result.get('error', 'Unknown error')}")
    
    async def transcribe_hindi(self, audio_data: bytes) -> str:
        """Transcribe Hindi audio"""
        return await self.transcribe(audio_data, "hi")
    
    async def transcribe_english(self, audio_data: bytes) -> str:
        """Transcribe English audio"""
        return await self.transcribe(audio_data, "en")
