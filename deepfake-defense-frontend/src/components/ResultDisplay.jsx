import authenticIcon from "../assets/authentic_2px.png";
import notAuthenticIcon from "../assets/not_authentic_2px.png";
import riskIcon from "../assets/risk_2px.png";
import securityIcon from "../assets/security_2px.png";

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
    ? (isDeepfake ? "SUSPICIOUS - Watermark present but AI detects anomalies" : "AUTHENTIC - Watermark verified")
    : "SUSPICIOUS - No watermark detected";

  return (
    <div className="bg-white/10 p-6 rounded-lg">
      <h2 className="text-lg font-bold uppercase tracking-widest font-dm-sans mb-8 text-center">
        Analysis Results
      </h2>

      <div className="flex justify-center gap-20 items-start">
        {/* Watermark Status - NOW FIRST (most important) */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={securityIcon}
            alt="Security"
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

        {/* AI Analysis */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={riskIcon}
            alt="Risk"
            className={`w-[150px] h-[150px] ${
              (riskLevel === "HIGH" || !hasWatermark) ? "animate-pulse-scale" : ""
            }`}
          />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
              AI Analysis
            </p>
            <p className="text-sm font-dm-sans font-light text-white/80">
              {isDeepfake ? "Deepfake detected" : "Appears authentic"}
              <br />
              <span className="font-bold">
                {(confidence * 100).toFixed(1)}%
              </span>{" "}
              confidence of being AI
            </p>
          </div>
        </div>

        {/* Overall Verdict - Based on watermark primarily */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={isSuspicious ? notAuthenticIcon : (isTrustworthy ? authenticIcon : notAuthenticIcon)}
            alt={isSuspicious || !isTrustworthy ? "Suspicious" : "Trustworthy"}
            className={`w-[150px] h-[150px] ${
              isSuspicious || !isTrustworthy ? "animate-pulse-scale" : ""
            }`}
          />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
              Verdict
            </p>
            <p className="text-sm font-dm-sans font-light text-white/80">
              {isSuspicious || !isTrustworthy ? "Suspicious" : "Trustworthy"}
            </p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className={`mt-6 p-4 rounded-lg text-center ${
        isTrustworthy ? "bg-green-900/30" : "bg-red-900/30"
      }`}>
        <p className="text-sm font-dm-sans font-light text-white/90">
          {overallVerdict}
        </p>
      </div>
    </div>
  );
}
