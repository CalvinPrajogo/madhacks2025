import authenticIcon from "../assets/authentic_2px.png";
import notAuthenticIcon from "../assets/not_authentic_2px.png";
import lowRiskIcon from "../assets/low_risk_2px.png";
import riskMediumIcon from "../assets/risk_medium_2px.png";
import riskHighIcon from "../assets/risk_high_2px.png";
import watermarkDetectedIcon from "../assets/watermark_detected_2px.png";
import noWatermarkIcon from "../assets/no_watermark_2px.png";

export default function ResultDisplay({ result, watermarkResult }) {
  if (!result) return null;

  const isDeepfake = result.data?.is_deepfake;
  const confidence = result.data?.confidence || 0;
  const riskLevel = result.data?.risk_level || "UNKNOWN";
  const hasWatermark = watermarkResult?.has_watermark || false;

  // Overall verdict: If no watermark AND confidence >= 50%, it's suspicious
  const isSuspicious = !hasWatermark && confidence >= 0.5;
  const isTrustworthy = hasWatermark && !isDeepfake;
  const overallVerdict = hasWatermark
    ? isDeepfake
      ? "SUSPICIOUS - Watermark present but AI detects anomalies"
      : "AUTHENTIC - Watermark verified"
    : "SUSPICIOUS - No watermark detected";

  return (
    <div className="bg-white/10 p-6 rounded-lg">
      <h2 className="text-lg font-bold uppercase tracking-widest font-dm-sans mb-8 text-center">
        Analysis Results
      </h2>

      <div className="flex justify-center gap-20 items-start">
        {/* Risk Level */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={
              riskLevel === "HIGH"
                ? riskHighIcon
                : riskLevel === "MEDIUM"
                ? riskMediumIcon
                : lowRiskIcon
            }
            alt="Risk"
            className={`w-[150px] h-[150px] ${
              riskLevel === "HIGH"
                ? "animate-pulse-scale"
                : riskLevel === "MEDIUM"
                ? "animate-vibrate"
                : ""
            }`}
          />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
              Risk Level
            </p>
            <p className="text-sm font-dm-sans font-light text-white/80">
              {riskLevel === "HIGH"
                ? "High"
                : riskLevel === "MEDIUM"
                ? "Medium"
                : riskLevel === "LOW"
                ? "Low"
                : riskLevel}{" "}
              -{" "}
              <span className="font-bold">
                {(confidence * 100).toFixed(1)}%
              </span>{" "}
              confidence
            </p>
          </div>
        </div>

        {/* Watermark Status */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={hasWatermark ? watermarkDetectedIcon : noWatermarkIcon}
            alt="Watermark"
            className={`w-[150px] h-[150px] ${
              !hasWatermark ? "animate-pulse-scale" : ""
            }`}
          />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
              Watermark
            </p>
            <p className="text-sm font-dm-sans font-light text-white/80">
              {hasWatermark ? "Watermark detected" : "No watermark detected"}
            </p>
          </div>
        </div>

        {/* Voice Authenticity */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={isDeepfake ? notAuthenticIcon : authenticIcon}
            alt="Authenticity"
            className={`w-[150px] h-[150px] ${
              isDeepfake ? "animate-pulse-scale" : ""
            }`}
          />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
              Voice Authenticity
            </p>
            <p className="text-sm font-dm-sans font-light text-white/80">
              {isDeepfake ? "Not Authentic" : "Authentic"}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="mt-8 text-center">
        <h2
          className="text-lg font-bold uppercase tracking-widest font-dm-sans"
          style={{
            color:
              hasWatermark && !isDeepfake
                ? "#89F4B4"
                : hasWatermark
                ? "#FFDC83"
                : "#FF647E",
          }}
        >
          {hasWatermark && !isDeepfake ? "AUTHENTIC" : "SUSPICIOUS"} -{" "}
          {hasWatermark
            ? isDeepfake
              ? "Watermark present but AI detects anomalies"
              : "Watermark verified"
            : "No watermark detected"}
        </h2>
      </div>
    </div>
  );
}
