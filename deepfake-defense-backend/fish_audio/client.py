import httpx
import os
from dotenv import load_dotenv
from typing import Dict, Optional

load_dotenv()


class FishAudioClient:
    """
    Client for Fish Audio API to create voice models and synthesize speech.
    Based on Fish Audio API v1 documentation.
    """

    def __init__(self):
        """Initialize Fish Audio client with API credentials."""
        self.api_key = os.getenv("FISH_AUDIO_API_KEY")
        self.base_url = os.getenv("FISH_AUDIO_BASE_URL", "https://api.fish.audio")

        if not self.api_key or self.api_key == "your_key_here":
            print("Warning: FISH_AUDIO_API_KEY not configured. Fish Audio features will not work.")

    async def create_model(
        self,
        audio_file_path: str,
        title: str,
        description: Optional[str] = None,
        visibility: str = "private",
        tags: Optional[list] = None
    ) -> Dict:
        """
        Create a new TTS voice model using Fish Audio API.

        Args:
            audio_file_path: Path to audio file for voice cloning
            title: Model title or name
            description: Model description (optional)
            visibility: Model visibility - "public", "unlist", or "private" (default: "private")
            tags: List of tags for the model (optional)

        Returns:
            Dictionary with model metadata including _id which can be used as voice_id

        API Endpoint: POST /model
        """
        if not self.api_key or self.api_key == "your_key_here":
            raise ValueError("Fish Audio API key not configured")

        async with httpx.AsyncClient(timeout=60.0) as client:
            with open(audio_file_path, 'rb') as f:
                # Prepare multipart form data
                files = {
                    'voices': (os.path.basename(audio_file_path), f, 'audio/wav')
                }

                data = {
                    'type': 'tts',
                    'title': title,
                    'train_mode': 'fast',
                    'visibility': visibility,
                }

                if description:
                    data['description'] = description

                if tags:
                    # Tags can be sent as multiple form fields
                    data['tags'] = tags

                response = await client.post(
                    f"{self.base_url}/model",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files=files,
                    data=data
                )
                response.raise_for_status()
                return response.json()

    # Alias for backwards compatibility
    async def clone_voice(self, audio_file_path: str, title: str = "Cloned Voice") -> Dict:
        """
        Clone voice from audio sample (alias for create_model).

        Args:
            audio_file_path: Path to audio file for voice cloning
            title: Name for the cloned voice model

        Returns:
            Dictionary with model_id (_id field) and other metadata
        """
        result = await self.create_model(
            audio_file_path=audio_file_path,
            title=title,
            description="Voice cloned for deepfake demonstration",
            visibility="private"
        )
        # Return in a format compatible with existing code
        return {
            "voice_id": result.get("_id"),
            "model_id": result.get("_id"),
            "title": result.get("title"),
            "state": result.get("state"),
            "created_at": result.get("created_at")
        }

    async def synthesize(
        self,
        text: str,
        voice_id: Optional[str] = None,
        format: str = "wav",
        model: str = "s1"
    ) -> bytes:
        """
        Generate speech from text using Fish Audio TTS.

        Args:
            text: Text to synthesize
            voice_id: Optional ID of the voice model to use (None = default voice)
            format: Output format - "wav", "mp3", "opus", or "pcm" (default: "wav")
            model: TTS model to use - "s1", "speech-1.6", or "speech-1.5" (default: "s1")

        Returns:
            Audio data as bytes

        API Endpoint: POST /v1/tts

        Note:
            Custom voice models created via /model endpoint currently return
            "Reference not found" when used with TTS. Use voice_id=None for
            default voice generation.
        """
        if not self.api_key or self.api_key == "your_key_here":
            raise ValueError("Fish Audio API key not configured")

        async with httpx.AsyncClient(timeout=60.0) as client:
            # Build request body
            request_body = {
                "text": text,
                "format": format
            }

            # Only add reference_id if voice_id is provided
            if voice_id:
                request_body["reference_id"] = voice_id

            response = await client.post(
                f"{self.base_url}/v1/tts",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=request_body
            )
            response.raise_for_status()
            return response.content
