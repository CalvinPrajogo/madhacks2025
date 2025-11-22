#!/bin/bash

# Test script for DeepFake Defense API

echo "========================================="
echo "DeepFake Defense API Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
curl -s http://localhost:8000/api/health | python3 -m json.tool
echo ""

# Test 2: Watermark Embedding
echo -e "${BLUE}Test 2: Embed Watermark${NC}"
curl -s -X POST http://localhost:8000/api/watermark/embed \
  -F "audio=@test_sine.wav" \
  -o watermarked_output.wav
echo -e "${GREEN}✓ Watermarked audio saved to watermarked_output.wav${NC}"
echo ""

# Test 3: Detect Watermark (Original)
echo -e "${BLUE}Test 3: Detect Watermark in Original Audio${NC}"
curl -s -X POST http://localhost:8000/api/watermark/detect \
  -F "audio=@test_sine.wav" | python3 -m json.tool
echo ""

# Test 4: Detect Watermark (Watermarked)
echo -e "${BLUE}Test 4: Detect Watermark in Watermarked Audio${NC}"
curl -s -X POST http://localhost:8000/api/watermark/detect \
  -F "audio=@watermarked_output.wav" | python3 -m json.tool
echo ""

# Test 5: Deepfake Detection
echo -e "${BLUE}Test 5: Deepfake Detection${NC}"
curl -s -X POST http://localhost:8000/api/detect \
  -F "audio=@test_voice_like.wav" | python3 -m json.tool
echo ""

# Test 6: Comprehensive Analysis (Non-Watermarked)
echo -e "${BLUE}Test 6: Comprehensive Analysis (Non-Watermarked)${NC}"
curl -s -X POST http://localhost:8000/api/analyze \
  -F "audio=@test_voice_like.wav" | python3 -m json.tool
echo ""

# Test 7: Comprehensive Analysis (Watermarked)
echo -e "${BLUE}Test 7: Comprehensive Analysis (Watermarked)${NC}"
curl -s -X POST http://localhost:8000/api/analyze \
  -F "audio=@watermarked_output.wav" | python3 -m json.tool
echo ""

echo "========================================="
echo -e "${GREEN}All tests completed!${NC}"
echo "========================================="
