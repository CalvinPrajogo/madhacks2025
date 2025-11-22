import numpy as np
from typing import Tuple


class AudioWatermarker:
    """
    Embeds and detects ultrasonic watermarks in audio files.
    Uses 19kHz frequency (above human hearing) to mark authentic recordings.
    """

    def __init__(self, frequency: int = 21000, strength: float = 0.005):
        # For hackathon demo: always use fixed frequency (21kHz)
        # To support per-user watermarking in the future, set frequency based on user info here
        """
        Initialize the watermarker.

        Args:
            frequency: Watermark frequency in Hz (default: 21000 Hz - well above human hearing)
            strength: Watermark signal strength (default: 0.005 = 0.5% amplitude, truly inaudible)
        """
        self.frequency = frequency
        self.strength = strength

    def embed(self, audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
        """
        Embed ultrasonic watermark into audio.

        Args:
            audio_data: Input audio as numpy array
            sample_rate: Sample rate in Hz

        Returns:
            Watermarked audio as numpy array
        """
        # Handle stereo audio - convert to mono for watermarking
        if len(audio_data.shape) > 1:
            audio_mono = np.mean(audio_data, axis=1)
        else:
            audio_mono = audio_data

        # Generate time array
        duration = len(audio_mono) / sample_rate
        t = np.linspace(0, duration, len(audio_mono))

        # Create sine wave at watermark frequency
        watermark_signal = np.sin(2 * np.pi * self.frequency * t)

        # Mix watermark with original audio
        watermarked = audio_mono + (self.strength * watermark_signal)

        # Normalize to prevent clipping
        max_val = np.max(np.abs(watermarked))
        if max_val > 1.0:
            watermarked = watermarked / max_val

        # Restore stereo if needed
        if len(audio_data.shape) > 1:
            watermarked = np.column_stack([watermarked, watermarked])

        return watermarked

    def detect(self, audio_data: np.ndarray, sample_rate: int) -> Tuple[bool, float]:
        """
        Detect watermark in audio.

        Args:
            audio_data: Audio to analyze as numpy array
            sample_rate: Sample rate in Hz

        Returns:
            Tuple of (has_watermark: bool, confidence: float)
        """
        # Validate input
        if audio_data is None or len(audio_data) == 0:
            print(f"[WATERMARK ERROR] Empty audio data received")
            return False, 0.0

        print(f"[WATERMARK DEBUG] Input audio shape: {audio_data.shape}, sample_rate: {sample_rate}")

        # Convert stereo to mono if needed
        if len(audio_data.shape) > 1:
            audio_mono = np.mean(audio_data, axis=1)
        else:
            audio_mono = audio_data

        if len(audio_mono) == 0:
            print(f"[WATERMARK ERROR] Audio is empty after mono conversion")
            return False, 0.0

        print(f"[WATERMARK DEBUG] Mono audio length: {len(audio_mono)}")

        # Perform FFT to convert to frequency domain
        fft = np.fft.fft(audio_mono)
        freqs = np.fft.fftfreq(len(audio_mono), 1 / sample_rate)

        # Get magnitude spectrum (positive frequencies only)
        magnitude = np.abs(fft[:len(fft)//2])
        freqs_positive = freqs[:len(freqs)//2]

        # Find the frequency bin closest to our watermark frequency
        target_idx = np.argmin(np.abs(freqs_positive - self.frequency))

        # Get magnitude at target frequency
        target_magnitude = magnitude[target_idx]

        # Calculate average magnitude in nearby frequencies (excluding target)
        window = 50  # bins around target
        start_idx = max(0, target_idx - window)
        end_idx = min(len(magnitude), target_idx + window)

        # Exclude the target bin from average calculation
        nearby_magnitudes = np.concatenate([
            magnitude[start_idx:target_idx],
            magnitude[target_idx+1:end_idx]
        ])

        if len(nearby_magnitudes) == 0:
            mean_magnitude = 1.0
        else:
            mean_magnitude = np.mean(nearby_magnitudes)

        # Calculate signal-to-noise ratio
        if mean_magnitude > 0:
            snr = target_magnitude / mean_magnitude
        else:
            snr = 0

        # Threshold for detection (watermark should be 1.1x stronger than noise, very forgiving for demo)
        threshold = 1.1
        print(f"[WATERMARK DETECT DEBUG] SNR: {snr:.2f}, threshold: {threshold}, target_magnitude: {target_magnitude:.4f}, mean_magnitude: {mean_magnitude:.4f}")
        has_watermark = snr > threshold

        # Confidence score (0-1)
        confidence = min(snr / (threshold * 2), 1.0)

        return has_watermark, float(confidence)
