import librosa
import numpy as np
from scipy import stats
from typing import Dict


class DeepfakeDetector:
    """
    Detects AI-generated speech using spectral analysis and acoustic features.
    Analyzes audio for artifacts typical of synthetic voices.
    """

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
        # Load audio file
        y, sr = librosa.load(audio_path, sr=None)

        features = {}

        # 1. Spectral Centroid - where frequencies are concentrated
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        features['spectral_centroid_mean'] = float(np.mean(spectral_centroid))
        features['spectral_centroid_std'] = float(np.std(spectral_centroid))

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

        # Initialize score (0.0 = definitely real, 1.0 = definitely fake)
        score = 0.5  # baseline

        # AI voices typically have more consistent spectral centroids
        if features['spectral_centroid_std'] < 200:
            score += 0.15

        # Smoother transitions (lower kurtosis magnitude)
        if abs(features['kurtosis']) < 5:
            score += 0.15

        # Less natural high-frequency content
        if features['rolloff_mean'] < 4000:
            score += 0.10

        # Very consistent MFCC patterns
        if features['mfcc_std'] < 10:
            score += 0.10

        # Too consistent energy levels
        if features['rms_std'] < 0.02:
            score += 0.08

        # Unnaturally low spectral bandwidth variation
        if features['bandwidth_std'] < 100:
            score += 0.07

        # Very consistent zero-crossing rate (unnatural)
        if features['zcr_std'] < 0.01:
            score += 0.08

        # Low MFCC variance (AI voices more uniform)
        if features['mfcc_variance_mean'] < 50:
            score += 0.07

        # Clamp score to 0-1 range
        score = max(0.0, min(1.0, score))

        # Determine if deepfake
        is_deepfake = score > 0.65

        # Determine risk level
        if score < 0.4:
            risk_level = "LOW"
        elif score < 0.65:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        return {
            "is_deepfake": is_deepfake,
            "confidence": round(score, 3),
            "risk_level": risk_level,
            "features": features
        }
