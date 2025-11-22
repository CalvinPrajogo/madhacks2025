# DeepFake Defense Backend

Voice authentication system that protects against deepfake attacks using ultrasonic watermarking and AI detection.

## Features

- **Ultrasonic Watermarking**: Embed 19kHz signatures in voice recordings
- **Deepfake Detection**: AI-powered analysis to identify synthetic speech
- **Fish Audio Integration**: Voice cloning for demonstration purposes
- **RESTful API**: FastAPI-based backend with comprehensive endpoints

## Installation

### 1. Create Virtual Environment

```bash
cd deepfake-defense-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Edit `.env` file and add your Fish Audio API key:
```
FISH_AUDIO_API_KEY=your_actual_key_here
FISH_AUDIO_BASE_URL=https://api.fish.audio/v1
```

## Running the Server

```bash
uvicorn app:app --reload --port 8000
```

Server runs at: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Embed Watermark
```bash
curl -X POST http://localhost:8000/api/watermark/embed \
  -F "audio=@test_audio.wav" \
  -o watermarked.wav
```

### Detect Watermark
```bash
curl -X POST http://localhost:8000/api/watermark/detect \
  -F "audio=@test_audio.wav"
```

### Detect Deepfake
```bash
curl -X POST http://localhost:8000/api/detect \
  -F "audio=@test_audio.wav"
```

### Comprehensive Analysis
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "audio=@test_audio.wav"
```

## Project Structure

```
deepfake-defense-backend/
├── app.py                 # Main FastAPI application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── models/
│   └── detector.py       # Deepfake detection logic
├── watermark/
│   └── embedder.py       # Audio watermarking
└── fish_audio/
    └── client.py         # Fish Audio API client
```

## How It Works

### Watermarking
1. User records voice → receives unique 19kHz watermark
2. Watermark embedded in real-time during calls
3. Suspicious audio checked for watermark
4. Missing watermark = potential deepfake

### Detection
1. Extract acoustic features (spectral centroid, MFCCs, etc.)
2. Apply heuristic scoring for AI artifacts
3. Return confidence score and risk level

## Testing

Create a test audio file:
```python
import numpy as np
import soundfile as sf

sr = 44100
duration = 3
t = np.linspace(0, duration, int(sr * duration))
audio = np.sin(2 * np.pi * 440 * t)  # 440 Hz tone
sf.write('test_sine.wav', audio, sr)
```

## License

MIT
