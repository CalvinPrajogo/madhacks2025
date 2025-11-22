import httpx
import os
from dotenv import load_dotenv
from typing import Dict

load_dotenv()


class FishAudioClient:
    """
    Client for Fish Audio API to clone voices and synthesize speech.
    """

    def __init__(self):
        """Initialize Fish Audio client with API credentials."""
        self.api_key = os.getenv("FISH_AUDIO_API_KEY")
        self.base_url = os.getenv("FISH_AUDIO_BASE_URL", "https://api.fish.audio/v1")

        if not self.api_key or self.api_key == "your_key_here":
            print("Warning: FISH_AUDIO_API_KEY not configured. Fish Audio features will not work.")

    async def clone_voice(self, audio_file_path: str) -> Dict:
        """
        Clone voice from audio sample.

        Args:
            audio_file_path: Path to audio file for voice cloning

        Returns:
            Dictionary with voice_id and other metadata

        Note:
            This is a placeholder implementation. Update with actual Fish Audio API endpoints.
        """
        if not self.api_key or self.api_key == "your_key_here":
            raise ValueError("Fish Audio API key not configured")

        async with httpx.AsyncClient(timeout=30.0) as client:
            with open(audio_file_path, 'rb') as f:
                files = {'audio': (os.path.basename(audio_file_path), f, 'audio/wav')}

                response = await client.post(
                    f"{self.base_url}/voice/clone",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files=files
                )
                response.raise_for_status()
                return response.json()

    async def synthesize(self, text: str, voice_id: str) -> bytes:
        """
        Generate speech from text using cloned voice.

        Args:
            text: Text to synthesize
            voice_id: ID of the cloned voice to use

        Returns:
            Audio data as bytes

        Note:
            This is a placeholder implementation. Update with actual Fish Audio API endpoints.
        """
        if not self.api_key or self.api_key == "your_key_here":
            raise ValueError("Fish Audio API key not configured")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/tts",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "text": text,
                    "voice_id": voice_id
                }
            )
            response.raise_for_status()
            return response.content
