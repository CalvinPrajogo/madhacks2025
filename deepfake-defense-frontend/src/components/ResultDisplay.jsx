export default function ResultDisplay({ result, watermarkResult }) {
  if (!result) return null;

  const isDeepfake = result.data?.is_deepfake;
  const confidence = result.data?.confidence || 0;
  const riskLevel = result.data?.risk_level || "UNKNOWN";

  return (
    <div
      className={`p-6 rounded-lg border-2 ${
        isDeepfake
          ? "bg-red-900/20 border-red-500"
          : "bg-green-900/20 border-green-500"
      }`}
    >
      <div className="text-center">
        <div className="text-6xl mb-4">{isDeepfake ? "⚠️" : "✅"}</div>

        <h2 className="text-3xl font-bold mb-2">
          {isDeepfake ? "DEEPFAKE DETECTED" : "AUTHENTIC VOICE"}
        </h2>

        <div className="text-xl mb-4">
          Confidence: {(confidence * 100).toFixed(1)}%
        </div>

        <div
          className={`inline-block px-4 py-2 rounded-full font-bold ${
            riskLevel === "HIGH"
              ? "bg-red-600"
              : riskLevel === "MEDIUM"
              ? "bg-yellow-600"
              : "bg-green-600"
          }`}
        >
          Risk Level: {riskLevel}
        </div>

        {/* Confidence bar */}
        <div className="mt-6 bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isDeepfake ? "bg-red-500" : "bg-green-500"
            }`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>

        {/* Watermark status */}
        {watermarkResult && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-bold mb-2">Watermark Status:</h3>
            <p
              className={
                watermarkResult.has_watermark
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {watermarkResult.has_watermark
                ? "✅ Protected watermark detected"
                : "❌ No watermark found"}
            </p>
          </div>
        )}

        {/* Feature details (collapsible) */}
        {result.data?.features && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer font-bold">
              View Analysis Details
            </summary>
            <pre className="mt-2 p-4 bg-gray-800 rounded text-sm overflow-auto">
              {JSON.stringify(result.data.features, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
