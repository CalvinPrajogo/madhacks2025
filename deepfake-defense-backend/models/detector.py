
import os
import librosa
import numpy as np
from scipy import stats
from typing import Dict



class DeepfakeDetector:
    """
    Detects AI-generated speech using spectral analysis and acoustic features.
    Analyzes audio for artifacts typical of synthetic voices.
    """

    def debug_read_uploadfile(self, upload_file):
        import soundfile as sf
        try:
            upload_file.file.seek(0)
            data, samplerate = sf.read(upload_file.file)
            print(f"[DEBUG] soundfile.read (in-memory): data.shape={data.shape}, samplerate={samplerate}, data[:10]={data[:10] if len(data) >= 10 else data}")
        except Exception as e:
            print(f"[DEBUG] soundfile.read (in-memory) failed: {e}")

    def __init__(self):
        """Initialize the deepfake detector."""
        pass

    def extract_features(self, audio_path: str) -> Dict[str, float]:
        """
        Extract acoustic features from audio file.

        Args:
            audio_path: Path to audio file

        Returns:
            Dictionary of extracted features
        """
        # Log file path and size before loading
        try:
            file_size = os.path.getsize(audio_path)
        except Exception as e:
            file_size = f"Error: {e}"
        print(f"[DEBUG] About to load audio file: {audio_path}, size={file_size} bytes")
        # Print first 32 bytes of the file for header check
        try:
            with open(audio_path, 'rb') as f:
                header_bytes = f.read(32)
            print(f"[DEBUG] First 32 bytes: {header_bytes}")
        except Exception as e:
            print(f"[DEBUG] Could not read file header: {e}")

        # Try loading with soundfile first
        import soundfile as sf
        try:
            y_sf, sr_sf = sf.read(audio_path)
            print(f"[DEBUG] soundfile.read: y.shape={y_sf.shape}, sr={sr_sf}, y[:10]={y_sf[:10] if len(y_sf) >= 10 else y_sf}")
        except Exception as e:
            print(f"[DEBUG] soundfile.read failed: {e}")

        # Load audio file with librosa (as before)
        y, sr = librosa.load(audio_path, sr=None)
        print(f"[DEBUG] librosa.load: y.shape={y.shape}, sr={sr}, y[:10]={y[:10] if len(y) >= 10 else y}")

        # Validate audio is not empty and has minimum length
        min_samples = sr * 0.5  # Minimum 0.5 seconds of audio
        if len(y) == 0:
            print(f"[ERROR] Audio file is empty after loading")
            # Return a neutral result for empty audio
            return {
                "is_deepfake": False,
                "confidence": 0.0,
                "risk_level": "UNKNOWN",
                "features": {}
            }
        elif len(y) < min_samples:
            print(f"[WARNING] Audio file is very short: {len(y)} samples ({len(y)/sr:.2f}s)")
            # Return neutral result for very short audio
            return {
                "is_deepfake": False,
                "confidence": 0.3,
                "risk_level": "UNKNOWN",
                "features": {"duration": len(y)/sr}
            }

        features = {}

        try:
            # 1. Spectral Centroid - where frequencies are concentrated
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            features['spectral_centroid_mean'] = float(np.mean(spectral_centroid))
            features['spectral_centroid_std'] = float(np.std(spectral_centroid))
        except Exception as e:
            print(f"[ERROR] Spectral centroid extraction failed: {e}")
            features['spectral_centroid_mean'] = 0.0
            features['spectral_centroid_std'] = 0.0

        # 2. MFCCs - voice characteristics (13 coefficients)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        features['mfcc_mean'] = float(np.mean(mfccs))
        features['mfcc_std'] = float(np.std(mfccs))

        # MFCC variance across coefficients (AI voices often more uniform)
        mfcc_variance_per_coef = np.var(mfccs, axis=1)
        features['mfcc_variance_mean'] = float(np.mean(mfcc_variance_per_coef))

        # 3. Zero-crossing rate - naturalness of transitions
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        features['zcr_mean'] = float(np.mean(zcr))
        features['zcr_std'] = float(np.std(zcr))

        # 4. Spectral rolloff - high-frequency content
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        features['rolloff_mean'] = float(np.mean(spectral_rolloff))
        features['rolloff_std'] = float(np.std(spectral_rolloff))

        # 5. Statistical moments - detect unnatural smoothness
        features['kurtosis'] = float(stats.kurtosis(y))
        features['skew'] = float(stats.skew(y))

        # 6. Spectral bandwidth - frequency range
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
        features['bandwidth_mean'] = float(np.mean(spectral_bandwidth))
        features['bandwidth_std'] = float(np.std(spectral_bandwidth))

        # 7. RMS Energy - volume consistency
        rms = librosa.feature.rms(y=y)[0]
        features['rms_mean'] = float(np.mean(rms))
        features['rms_std'] = float(np.std(rms))

        # 8. Spectral contrast - peak-to-valley ratios
        spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        features['contrast_mean'] = float(np.mean(spectral_contrast))
        features['contrast_std'] = float(np.std(spectral_contrast))

        print(f"[DEBUG] Extracted features: {features}")
        return features

    def detect(self, audio_path: str) -> Dict:
        """
        Detect if audio is a deepfake using heuristic scoring.

        Args:
            audio_path: Path to audio file

        Returns:
            Dictionary with detection results
        """
        # Extract features
        features = self.extract_features(audio_path)

        # If features extraction failed completely, return neutral
        if not features or len(features) == 0:
            return {
                "is_deepfake": False,
                "confidence": 0.5,
                "risk_level": "UNKNOWN",
                "features": {}
            }

        # Initialize score (0.0 = definitely real, 1.0 = definitely fake)
        score = 0.5  # baseline

        # AI voices typically have more consistent spectral centroids
        if features.get('spectral_centroid_std', 999) < 200:
            score += 0.15

        # Smoother transitions (lower kurtosis magnitude)
        if abs(features.get('kurtosis', 999)) < 5:
            score += 0.15

        # Less natural high-frequency content
        if features.get('rolloff_mean', 9999) < 4000:
            score += 0.10

        # Very consistent MFCC patterns
        if features.get('mfcc_std', 999) < 10:
            score += 0.10

        # Too consistent energy levels
        if features.get('rms_std', 999) < 0.02:
            score += 0.08

        # Unnaturally low spectral bandwidth variation
        if features.get('bandwidth_std', 999) < 100:
            score += 0.07

        # Very consistent zero-crossing rate (unnatural)
        if features.get('zcr_std', 999) < 0.01:
            score += 0.08

        # Low MFCC variance (AI voices more uniform)
        if features.get('mfcc_variance_mean', 999) < 50:
            score += 0.07

        # Clamp score to 0-1 range
        score = max(0.0, min(1.0, score))
        print(f"[DEBUG] Deepfake score: {score}")

        # Determine if deepfake (lowered threshold for demo - modern TTS is very good)
        # Using >= 0.5 so that 50% or higher confidence is flagged as AI-generated
        is_deepfake = score >= 0.5

        # Determine risk level
        if score < 0.4:
            risk_level = "LOW"
        elif score < 0.65:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        result = {
            "is_deepfake": is_deepfake,
            "confidence": round(score, 3),
            "risk_level": risk_level,
            "features": features
        }
        print(f"[DEBUG] Detection result: {result}")
        return result
