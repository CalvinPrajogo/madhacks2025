"""
Generate test audio files for testing the DeepFake Defense system.
"""

import numpy as np
import soundfile as sf

def generate_test_audio():
    """Generate simple test audio files."""

    # Configuration
    sample_rate = 44100
    duration = 3  # seconds

    # Generate time array
    t = np.linspace(0, duration, int(sample_rate * duration))

    # 1. Simple sine wave (440 Hz - A4 note)
    print("Generating test_sine.wav...")
    sine_audio = np.sin(2 * np.pi * 440 * t)
    sf.write('test_sine.wav', sine_audio, sample_rate)
    print("✓ Created test_sine.wav")

    # 2. More complex tone (musical chord)
    print("\nGenerating test_chord.wav...")
    # A major chord: A (440 Hz), C# (554.37 Hz), E (659.25 Hz)
    chord_audio = (
        np.sin(2 * np.pi * 440 * t) +
        np.sin(2 * np.pi * 554.37 * t) +
        np.sin(2 * np.pi * 659.25 * t)
    ) / 3
    sf.write('test_chord.wav', chord_audio, sample_rate)
    print("✓ Created test_chord.wav")

    # 3. Voice-like sound (mix of frequencies)
    print("\nGenerating test_voice_like.wav...")
    # Fundamental frequency and harmonics (simulating voice)
    f0 = 150  # Base frequency
    voice_like = (
        1.0 * np.sin(2 * np.pi * f0 * t) +
        0.5 * np.sin(2 * np.pi * 2*f0 * t) +
        0.3 * np.sin(2 * np.pi * 3*f0 * t) +
        0.2 * np.sin(2 * np.pi * 4*f0 * t) +
        0.1 * np.sin(2 * np.pi * 5*f0 * t)
    )
    # Add some amplitude variation
    envelope = 0.5 + 0.5 * np.sin(2 * np.pi * 2 * t)
    voice_like = voice_like * envelope
    # Normalize
    voice_like = voice_like / np.max(np.abs(voice_like))
    sf.write('test_voice_like.wav', voice_like, sample_rate)
    print("✓ Created test_voice_like.wav")

    print("\n✅ All test audio files generated successfully!")
    print("\nYou can now test the API with these files:")
    print("  - test_sine.wav")
    print("  - test_chord.wav")
    print("  - test_voice_like.wav")

if __name__ == "__main__":
    generate_test_audio()
