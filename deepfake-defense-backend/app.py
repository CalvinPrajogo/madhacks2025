from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import soundfile as sf
import io
import os
import tempfile
import httpx
from datetime import datetime
from typing import Optional

from watermark.embedder import AudioWatermarker
from models.detector import DeepfakeDetector
from fish_audio.client import FishAudioClient

app = FastAPI(
    title="DeepFake Defense API",
    description="Voice authentication system with ultrasonic watermarking and AI detection",
    version="1.0.0"
)

# CORS - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
watermarker = AudioWatermarker()
detector = DeepfakeDetector()
fish_client = FishAudioClient()


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "DeepFake Defense API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/watermark/embed")
async def embed_watermark(audio: UploadFile = File(...)):
    """
    Add ultrasonic watermark to audio file.

    Args:
        audio: Audio file to watermark (WAV, MP3, etc.)

    Returns:
        Watermarked audio file
    """
    try:
        # Read uploaded audio
        audio_bytes = await audio.read()
        audio_data, sample_rate = sf.read(io.BytesIO(audio_bytes))

        # Add watermark
        watermarked = watermarker.embed(audio_data, sample_rate)

        # Convert back to bytes
        output = io.BytesIO()
        sf.write(output, watermarked, sample_rate, format='WAV')
        output.seek(0)

        # Return audio file
        return Response(
            content=output.getvalue(),
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=watermarked.wav"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error embedding watermark: {str(e)}")


@app.post("/api/watermark/detect")
async def detect_watermark(audio: UploadFile = File(...)):
    """
    Check if audio contains watermark.

    Args:
        audio: Audio file to analyze

    Returns:
        Detection results with confidence score
    """
    try:
        # Read uploaded audio
        audio_bytes = await audio.read()
        audio_data, sample_rate = sf.read(io.BytesIO(audio_bytes))

        # Detect watermark
        has_watermark, confidence = watermarker.detect(audio_data, sample_rate)

        return {
            "status": "success",
            "has_watermark": bool(has_watermark),
            "confidence": float(confidence),
            "watermark_status": "protected" if has_watermark else "unprotected",
            "watermark_frequency": watermarker.frequency
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting watermark: {str(e)}")


@app.post("/api/detect")
async def detect_deepfake(audio: UploadFile = File(...)):
    """
    Analyze audio for deepfake indicators.

    Args:
        audio: Audio file to analyze

    Returns:
        Detection results with risk level and confidence
    """
    temp_path = None
    try:
        # Save to temp file (librosa needs file path)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            tmp.write(await audio.read())
            temp_path = tmp.name

        # Detect deepfake
        result = detector.detect(temp_path)

        return {
            "status": "success",
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting deepfake: {str(e)}")

    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/api/analyze")
async def analyze_audio(audio: UploadFile = File(...)):
    """
    Comprehensive analysis combining watermark detection and deepfake detection.

    Args:
        audio: Audio file to analyze

    Returns:
        Combined analysis results
    """
    temp_path = None
    try:
        # Read audio
        audio_bytes = await audio.read()
        audio_data, sample_rate = sf.read(io.BytesIO(audio_bytes))

        # Save to temp file for deepfake detection
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            sf.write(tmp.name, audio_data, sample_rate)
            temp_path = tmp.name

        # Detect watermark
        has_watermark, watermark_confidence = watermarker.detect(audio_data, sample_rate)

        # Detect deepfake
        deepfake_result = detector.detect(temp_path)

        # Determine overall authenticity
        has_watermark_bool = bool(has_watermark)
        is_deepfake_bool = bool(deepfake_result['is_deepfake'])

        if has_watermark_bool and not is_deepfake_bool:
            authenticity = "AUTHENTIC"
            overall_confidence = (watermark_confidence + (1 - deepfake_result['confidence'])) / 2
        elif not has_watermark_bool and is_deepfake_bool:
            authenticity = "FAKE"
            overall_confidence = (1 - watermark_confidence + deepfake_result['confidence']) / 2
        else:
            authenticity = "SUSPICIOUS"
            overall_confidence = 0.5

        return {
            "status": "success",
            "authenticity": authenticity,
            "overall_confidence": round(float(overall_confidence), 3),
            "watermark": {
                "detected": has_watermark_bool,
                "confidence": float(watermark_confidence)
            },
            "deepfake_analysis": {
                "is_deepfake": is_deepfake_bool,
                "confidence": float(deepfake_result['confidence']),
                "risk_level": deepfake_result['risk_level']
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing audio: {str(e)}")

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/api/clone-voice")
async def clone_voice(
    audio: UploadFile = File(...),
    title: str = Form(default="Cloned Voice")
):
    """
    Clone voice using Fish Audio API.

    Args:
        audio: Audio sample for voice cloning
        title: Name for the voice model (optional, default: "Cloned Voice")

    Returns:
        Voice ID and metadata
    """
    temp_path = None
    try:
        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            tmp.write(await audio.read())
            temp_path = tmp.name

        # Clone via Fish Audio
        result = await fish_client.clone_voice(temp_path, title=title)

        return {
            "status": "success",
            "data": result,
            "message": "Voice model created successfully. Use the voice_id for synthesis."
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Fish Audio API error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cloning voice: {str(e)}")

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/api/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    voice_id: str = Form(...)
):
    """
    Generate speech with cloned voice.

    Args:
        text: Text to synthesize
        voice_id: ID of cloned voice to use

    Returns:
        Synthesized audio file
    """
    try:
        # Generate speech
        audio_bytes = await fish_client.synthesize(text, voice_id)

        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "Content-Disposition": f"attachment; filename=synthesized.wav"
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error synthesizing speech: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
