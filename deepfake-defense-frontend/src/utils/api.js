const API_BASE = "http://localhost:8000/api";

export const api = {
  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  },

  // Embed watermark in audio
  async embedWatermark(audioFile) {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await fetch(`${API_BASE}/watermark/embed`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to embed watermark");
    return response.blob(); // Returns audio file
  },

  // Detect if audio has watermark
  async detectWatermark(audioFile) {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await fetch(`${API_BASE}/watermark/detect`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Watermark detection failed:", errorText);
      throw new Error(`Failed to detect watermark: ${errorText}`);
    }

    return response.json();
  },

  // Detect if audio is deepfake
  async detectDeepfake(audioFile) {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await fetch(`${API_BASE}/detect`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepfake detection failed:", errorText);
      throw new Error(`Failed to detect deepfake: ${errorText}`);
    }

    return response.json();
  },

  // Clone voice (Fish Audio)
  async cloneVoice(audioFile) {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await fetch(`${API_BASE}/clone-voice`, {
      method: "POST",
      body: formData,
    });

    return response.json();
  },

  // Synthesize speech
  async synthesizeSpeech(text, voiceId) {
    const response = await fetch(`${API_BASE}/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice_id: voiceId }),
    });

    return response.blob(); // Returns audio file
  },
};
