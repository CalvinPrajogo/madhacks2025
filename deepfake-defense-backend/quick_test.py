#!/usr/bin/env python3
"""
Quick test script for DeepFake Defense API
Run this to verify everything is working!
"""

import requests
import json
import os

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health():
    print_section("TEST 1: Health Check")
    response = requests.get(f"{BASE_URL}/api/health")
    data = response.json()
    print(json.dumps(data, indent=2))
    print(f"✓ Status: {data['status']}")

def test_watermark_embed():
    print_section("TEST 2: Embed Watermark")

    audio_file = "test_sine.wav"
    if not os.path.exists(audio_file):
        print(f"⚠️  File not found: {audio_file}")
        return

    with open(audio_file, "rb") as f:
        files = {"audio": f}
        response = requests.post(f"{BASE_URL}/api/watermark/embed", files=files)

    if response.status_code == 200:
        # Save the watermarked audio
        with open("watermarked_quick_test.wav", "wb") as f:
            f.write(response.content)
        print("✓ Watermark embedded successfully!")
        print("✓ Saved to: watermarked_quick_test.wav")
    else:
        print(f"✗ Error: {response.status_code}")

def test_watermark_detect():
    print_section("TEST 3: Detect Watermark")

    # Test original (no watermark)
    print("\nOriginal audio (no watermark):")
    with open("test_sine.wav", "rb") as f:
        files = {"audio": f}
        response = requests.post(f"{BASE_URL}/api/watermark/detect", files=files)
        data = response.json()
        print(f"  Has watermark: {data['has_watermark']}")
        print(f"  Confidence: {data['confidence']:.2f}")

    # Test watermarked
    if os.path.exists("watermarked_quick_test.wav"):
        print("\nWatermarked audio:")
        with open("watermarked_quick_test.wav", "rb") as f:
            files = {"audio": f}
            response = requests.post(f"{BASE_URL}/api/watermark/detect", files=files)
            data = response.json()
            print(f"  Has watermark: {data['has_watermark']}")
            print(f"  Confidence: {data['confidence']:.2f}")
            print(f"  Status: {data['watermark_status']}")

def test_deepfake_detection():
    print_section("TEST 4: Deepfake Detection")

    audio_file = "test_voice_like.wav"
    if not os.path.exists(audio_file):
        print(f"⚠️  File not found: {audio_file}")
        return

    with open(audio_file, "rb") as f:
        files = {"audio": f}
        response = requests.post(f"{BASE_URL}/api/detect", files=files)
        data = response.json()

        result = data['data']
        print(f"  Is Deepfake: {result['is_deepfake']}")
        print(f"  Confidence: {result['confidence']:.2f}")
        print(f"  Risk Level: {result['risk_level']}")

def test_comprehensive_analysis():
    print_section("TEST 5: Comprehensive Analysis")

    audio_file = "test_voice_like.wav"
    if not os.path.exists(audio_file):
        print(f"⚠️  File not found: {audio_file}")
        return

    with open(audio_file, "rb") as f:
        files = {"audio": f}
        response = requests.post(f"{BASE_URL}/api/analyze", files=files)
        data = response.json()

        print(f"  Authenticity: {data['authenticity']}")
        print(f"  Overall Confidence: {data['overall_confidence']:.2f}")
        print(f"\n  Watermark Analysis:")
        print(f"    - Detected: {data['watermark']['detected']}")
        print(f"    - Confidence: {data['watermark']['confidence']:.2f}")
        print(f"\n  Deepfake Analysis:")
        print(f"    - Is Deepfake: {data['deepfake_analysis']['is_deepfake']}")
        print(f"    - Confidence: {data['deepfake_analysis']['confidence']:.2f}")
        print(f"    - Risk Level: {data['deepfake_analysis']['risk_level']}")

def test_voice_cloning():
    print_section("TEST 6: Voice Cloning (Fish Audio)")

    audio_file = "test_voice_like.wav"
    if not os.path.exists(audio_file):
        print(f"⚠️  File not found: {audio_file}")
        return

    try:
        with open(audio_file, "rb") as f:
            files = {"audio": f}
            data = {"title": "Quick Test Voice"}
            response = requests.post(f"{BASE_URL}/api/clone-voice", files=files, data=data)

            if response.status_code == 200:
                result = response.json()
                print(f"✓ Voice cloned successfully!")
                print(f"  Voice ID: {result['data']['voice_id']}")
                print(f"  State: {result['data']['state']}")
                print(f"  Title: {result['data']['title']}")
            else:
                print(f"⚠️  Error: {response.status_code}")
                print(f"  {response.text}")
    except Exception as e:
        print(f"⚠️  Error: {str(e)}")

def main():
    print("\n" + "🎯" * 30)
    print("  DeepFake Defense - Quick Test Suite")
    print("🎯" * 30)

    try:
        test_health()
        test_watermark_embed()
        test_watermark_detect()
        test_deepfake_detection()
        test_comprehensive_analysis()
        test_voice_cloning()

        print("\n" + "="*60)
        print("  ✅ All tests completed!")
        print("="*60)
        print("\n📚 For more testing options, see TESTING_GUIDE.md")
        print("🌐 Interactive API docs: http://localhost:8000/docs")

    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to server!")
        print("   Make sure the server is running:")
        print("   cd deepfake-defense-backend")
        print("   source venv/bin/activate")
        print("   uvicorn app:app --reload --port 8000")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    main()
