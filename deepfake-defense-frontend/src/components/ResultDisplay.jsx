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

  return (
    <div className="bg-white/10 p-6 rounded-lg">
      <h2 className="text-lg font-bold uppercase tracking-widest font-dm-sans mb-8 text-center">
        Analysis Results
      </h2>
      
      <div className="flex justify-center gap-20 items-start">
        {/* Authenticity Status */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={isDeepfake ? notAuthenticIcon : authenticIcon}
            alt={isDeepfake ? "Not Authentic" : "Authentic"}
            className={`w-[150px] h-[150px] ${isDeepfake ? 'animate-pulse-scale' : ''}`}
          />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
              Voice Authenticity
            </p>
            <p className="text-sm font-dm-sans font-light text-white/80">
              {isDeepfake ? "Not authentic" : "Authentic"}
            </p>
          </div>
        </div>

        {/* Risk Level */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={riskIcon}
            alt="Risk"
            className={`w-[150px] h-[150px] ${riskLevel === "HIGH" ? 'animate-pulse-scale' : ''}`}
          />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
              Risk Level
            </p>
            <p className="text-sm font-dm-sans font-light text-white/80">
              {riskLevel === "HIGH" ? "High" : riskLevel === "MEDIUM" ? "Medium" : riskLevel === "LOW" ? "Low" : riskLevel} - <span className="font-bold">{(confidence * 100).toFixed(1)}%</span> confidence
            </p>
          </div>
        </div>

        {/* Watermark Status */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={securityIcon}
            alt="Security"
            className="w-[150px] h-[150px]"
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
      </div>
    </div>
  );
}
