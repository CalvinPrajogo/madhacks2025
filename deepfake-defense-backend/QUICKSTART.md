# DeepFake Defense - Quick Start Guide

## 🚀 Getting Started (3 Minutes)

### 1. Server is Already Running!

The server is currently running at:
- **API**: `http://localhost:8000`
- **Docs**: `http://localhost:8000/docs`

### 2. Test It Immediately

**Health Check**:
```bash
curl http://localhost:8000/api/health
```

**Embed a Watermark**:
```bash
curl -X POST http://localhost:8000/api/watermark/embed \
  -F "audio=@test_sine.wav" \
  -o my_watermarked.wav
```

**Check for Watermark**:
```bash
curl -X POST http://localhost:8000/api/watermark/detect \
  -F "audio=@my_watermarked.wav"
```

### 3. Run Full Test Suite

```bash
./test_api.sh
```

## 📡 Frontend Integration Example

```javascript
// Upload audio and get analysis
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:8000/api/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();

// Result structure:
// {
//   "authenticity": "AUTHENTIC" | "FAKE" | "SUSPICIOUS",
//   "overall_confidence": 0.917,
//   "watermark": {
//     "detected": true,
//     "confidence": 1.0
//   },
//   "deepfake_analysis": {
//     "is_deepfake": false,
//     "confidence": 0.23,
//     "risk_level": "LOW"
//   }
// }
```

## 🔑 Key API Endpoints

| Endpoint | What It Does |
|----------|--------------|
| `POST /api/watermark/embed` | Add 19kHz watermark to audio |
| `POST /api/watermark/detect` | Check if audio has watermark |
| `POST /api/detect` | Analyze audio for AI artifacts |
| `POST /api/analyze` | Full analysis (recommended) |

## 📊 Understanding Results

### Watermark Detection
- `confidence > 0.5` → Watermark present
- `confidence < 0.3` → No watermark

### Deepfake Detection
- **HIGH risk** (confidence > 0.65) → Likely AI-generated
- **MEDIUM risk** (0.4 - 0.65) → Suspicious
- **LOW risk** (< 0.4) → Likely authentic

### Overall Authenticity
- **AUTHENTIC** → Has watermark + No AI artifacts
- **FAKE** → No watermark + AI artifacts detected
- **SUSPICIOUS** → Mixed signals (investigate further)

## 🛠️ Restarting the Server

If you need to restart:

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
cd deepfake-defense-backend
source venv/bin/activate
uvicorn app:app --reload --port 8000
```

## 📝 Example Use Cases

### Use Case 1: Protect Your Voice Recording
```bash
# Record audio → save as recording.wav
# Add watermark
curl -X POST http://localhost:8000/api/watermark/embed \
  -F "audio=@recording.wav" \
  -o protected_recording.wav
```

### Use Case 2: Verify Suspicious Audio
```bash
# Received suspicious_call.wav
# Check authenticity
curl -X POST http://localhost:8000/api/analyze \
  -F "audio=@suspicious_call.wav"
```

### Use Case 3: Batch Processing
```bash
# Check multiple files
for file in *.wav; do
  echo "Analyzing $file"
  curl -X POST http://localhost:8000/api/analyze -F "audio=@$file"
done
```

## 🎯 Success Indicators

You know it's working when:
- ✅ Watermarked audio shows `confidence: 1.0`
- ✅ Original audio shows `confidence: 0.1-0.3`
- ✅ Test audio shows `risk_level: "HIGH"`
- ✅ All requests return in < 1 second

## 🐛 Troubleshooting

**Server not responding?**
- Check if server is running: `lsof -i :8000`
- Check logs in terminal where uvicorn is running

**CORS errors from browser?**
- Frontend must be on `localhost:5173` or `localhost:3000`
- Update CORS settings in [app.py](app.py:25) if needed

**File upload failing?**
- Ensure file is WAV or MP3 format
- File size should be < 50MB
- Check file permissions

## 📚 More Information

- Full documentation: [SETUP_COMPLETE.md](SETUP_COMPLETE.md)
- Project README: [README.md](README.md)
- API Docs (interactive): http://localhost:8000/docs

## 🎓 How It Works

**Watermarking**: We add a 19kHz ultrasonic tone (above human hearing) to authentic recordings. AI voice cloning destroys this signal because it focuses on audible frequencies.

**Detection**: We analyze 8 acoustic features (spectral centroid, MFCCs, etc.) that differ between human and AI-generated voices.

**Combined Approach**: Missing watermark + AI artifacts = High confidence it's a deepfake!

---

**Ready to integrate with your frontend!** 🚀

Server Status: ✅ Running
Port: 8000
CORS: Enabled
Performance: < 1s response time
