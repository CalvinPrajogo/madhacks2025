# Testing the Backend Without a Frontend

There are several easy ways to test your DeepFake Defense backend without building a frontend first!

## Method 1: Interactive API Documentation (Easiest!) 🌟

**URL:** http://localhost:8000/docs

This gives you a beautiful, interactive interface where you can:
1. See all your endpoints
2. Click "Try it out" on any endpoint
3. Upload files directly
4. Execute requests
5. See responses in real-time

### Step-by-Step:

1. **Open in browser:** http://localhost:8000/docs
2. **Find an endpoint** (e.g., `/api/watermark/embed`)
3. **Click "Try it out"**
4. **Click "Choose File"** and select a test audio file
5. **Click "Execute"**
6. **See the response** below!

**This is the easiest way to test!** ✨

---

## Method 2: Use the Test Script (Automated)

We already created a comprehensive test script!

```bash
cd deepfake-defense-backend
./test_api.sh
```

This will automatically run through all endpoints and show you the results.

**What it tests:**
- Health check
- Watermark embedding
- Watermark detection
- Deepfake detection
- Comprehensive analysis

---

## Method 3: cURL Commands (Command Line)

### Quick Tests:

**1. Health Check:**
```bash
curl http://localhost:8000/api/health | python3 -m json.tool
```

**2. Embed Watermark:**
```bash
curl -X POST http://localhost:8000/api/watermark/embed \
  -F "audio=@deepfake-defense-backend/test_sine.wav" \
  -o watermarked_output.wav

echo "✓ Watermarked file saved!"
```

**3. Detect Watermark:**
```bash
curl -X POST http://localhost:8000/api/watermark/detect \
  -F "audio=@deepfake-defense-backend/test_sine.wav" \
  | python3 -m json.tool
```

**4. Detect Deepfake:**
```bash
curl -X POST http://localhost:8000/api/detect \
  -F "audio=@deepfake-defense-backend/test_voice_like.wav" \
  | python3 -m json.tool
```

**5. Comprehensive Analysis:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "audio=@deepfake-defense-backend/test_voice_like.wav" \
  | python3 -m json.tool
```

**6. Clone Voice:**
```bash
curl -X POST http://localhost:8000/api/clone-voice \
  -F "audio=@deepfake-defense-backend/test_voice_like.wav" \
  -F "title=My Test Voice" \
  | python3 -m json.tool
```

---

## Method 4: Python Script (Programmatic Testing)

Create a test file to interact with your API:

```python
# test_client.py
import requests
import json

BASE_URL = "http://localhost:8000"

# Test 1: Health Check
print("Testing health check...")
response = requests.get(f"{BASE_URL}/api/health")
print(json.dumps(response.json(), indent=2))

# Test 2: Upload and Analyze Audio
print("\nTesting audio analysis...")
with open("deepfake-defense-backend/test_voice_like.wav", "rb") as f:
    files = {"audio": f}
    response = requests.post(f"{BASE_URL}/api/analyze", files=files)
    result = response.json()
    print(json.dumps(result, indent=2))

    # Print key findings
    print(f"\n🎯 Authenticity: {result['authenticity']}")
    print(f"📊 Confidence: {result['overall_confidence']}")
    print(f"🔒 Watermark: {result['watermark']['detected']}")
    print(f"🚨 Deepfake Risk: {result['deepfake_analysis']['risk_level']}")
```

Run it:
```bash
python3 test_client.py
```

---

## Method 5: Postman (GUI Tool)

If you have Postman installed:

1. **Import the API:**
   - Go to http://localhost:8000/openapi.json
   - Copy the JSON
   - Import into Postman

2. **Create a new request:**
   - Method: POST
   - URL: http://localhost:8000/api/analyze
   - Body: form-data
   - Key: "audio" (type: File)
   - Value: Choose your audio file
   - Click Send!

---

## Method 6: HTTPie (User-Friendly cURL Alternative)

Install HTTPie: `brew install httpie` or `pip install httpx`

**Simpler syntax than cURL:**

```bash
# Analyze audio
http -f POST localhost:8000/api/analyze audio@deepfake-defense-backend/test_voice_like.wav

# Clone voice
http -f POST localhost:8000/api/clone-voice \
  audio@deepfake-defense-backend/test_voice_like.wav \
  title="My Voice"
```

---

## Method 7: Record Your Own Voice

Want to test with your actual voice?

### On Mac:
```bash
# Record 5 seconds
rec my_voice.wav trim 0 5

# Or use QuickTime Player: File → New Audio Recording
```

### On Linux:
```bash
# Record 5 seconds
arecord -d 5 my_voice.wav
```

### On Windows:
Use the Voice Recorder app, save as WAV

**Then test it:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "audio=@my_voice.wav" \
  | python3 -m json.tool
```

---

## Complete Testing Workflow

Here's a full demonstration flow:

### Step 1: Create Test Audio (if needed)
```bash
cd deepfake-defense-backend
python3 test_generate_audio.py
```

### Step 2: Test Basic Functionality
```bash
# Health check
curl http://localhost:8000/api/health

# Should return: {"status":"healthy",...}
```

### Step 3: Test Watermarking
```bash
# Embed watermark
curl -X POST http://localhost:8000/api/watermark/embed \
  -F "audio=@test_sine.wav" \
  -o watermarked.wav

# Check original (should have no watermark)
curl -X POST http://localhost:8000/api/watermark/detect \
  -F "audio=@test_sine.wav"

# Output: {"has_watermark": false, "confidence": 0.16}

# Check watermarked (should have watermark)
curl -X POST http://localhost:8000/api/watermark/detect \
  -F "audio=@watermarked.wav"

# Output: {"has_watermark": true, "confidence": 1.0}
```

### Step 4: Test Deepfake Detection
```bash
curl -X POST http://localhost:8000/api/detect \
  -F "audio=@test_voice_like.wav" \
  | python3 -m json.tool
```

### Step 5: Test Voice Cloning
```bash
curl -X POST http://localhost:8000/api/clone-voice \
  -F "audio=@test_voice_like.wav" \
  -F "title=Demo Voice" \
  | python3 -m json.tool

# Save the voice_id from the response for later!
```

---

## Interactive Python Session (REPL)

Start Python and test interactively:

```python
python3
```

```python
>>> import requests
>>>
>>> # Test health
>>> r = requests.get("http://localhost:8000/api/health")
>>> r.json()
{'status': 'healthy', 'version': '1.0.0', ...}
>>>
>>> # Test with file
>>> with open("deepfake-defense-backend/test_sine.wav", "rb") as f:
...     files = {"audio": f}
...     r = requests.post("http://localhost:8000/api/analyze", files=files)
...     print(r.json())
...
{'status': 'success', 'authenticity': 'FAKE', ...}
```

---

## Recommended Testing Order

1. **Start with Swagger UI** (http://localhost:8000/docs)
   - Click around, test each endpoint
   - See what responses look like
   - Upload different files

2. **Run the automated test script**
   ```bash
   ./test_api.sh
   ```
   - Verifies everything works
   - Shows complete workflow

3. **Test with your own audio**
   - Record your voice
   - Test watermarking
   - Test detection

4. **Test voice cloning**
   - Clone your voice
   - Save the voice_id
   - Use it for demos

---

## Troubleshooting

**Server not responding?**
```bash
# Check if server is running
lsof -i :8000

# If not, start it
cd deepfake-defense-backend
source venv/bin/activate
uvicorn app:app --reload --port 8000
```

**File not found errors?**
```bash
# Make sure you're in the right directory
cd /Users/calvinprajogo/Personal\ Code\ Projects/madhacks2025

# Use absolute paths in curl
curl -X POST http://localhost:8000/api/analyze \
  -F "audio=@$(pwd)/deepfake-defense-backend/test_sine.wav"
```

**Can't install HTTPie or other tools?**
- Just use the Swagger UI at http://localhost:8000/docs
- Or use the test_api.sh script
- Both work without installing anything extra!

---

## Best Testing Method for Demos

**For hackathon presentations:**

1. **Open Swagger UI** in a browser (http://localhost:8000/docs)
2. **Screen share** the browser
3. **Click through endpoints** live
4. **Upload files** and show results in real-time
5. **Point out the confidence scores** and risk levels

This is the most visual and impressive way to demonstrate your backend!

---

## Quick Reference Card

| What to Test | Command |
|--------------|---------|
| Interactive UI | Open http://localhost:8000/docs in browser |
| All endpoints | `./test_api.sh` |
| Health check | `curl http://localhost:8000/api/health` |
| Embed watermark | `curl -X POST http://localhost:8000/api/watermark/embed -F "audio=@file.wav" -o output.wav` |
| Detect watermark | `curl -X POST http://localhost:8000/api/watermark/detect -F "audio=@file.wav"` |
| Detect deepfake | `curl -X POST http://localhost:8000/api/detect -F "audio=@file.wav"` |
| Full analysis | `curl -X POST http://localhost:8000/api/analyze -F "audio=@file.wav"` |
| Clone voice | `curl -X POST http://localhost:8000/api/clone-voice -F "audio=@file.wav" -F "title=Name"` |

---

**🌟 Recommended: Start with the Swagger UI at http://localhost:8000/docs**

It's the easiest way to test and requires no command-line knowledge!
