import { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";
import FileUpload from "./FileUpload";
import ResultDisplay from "./ResultDisplay";
import { api } from "../utils/api";

export default function DeepfakeDetector() {
  const [audioFile, setAudioFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [watermarkResult, setWatermarkResult] = useState(null);
  const [useWatermark, setUseWatermark] = useState(false);

  const analyzeAudio = async (file) => {
    setAudioFile(file);
    setAnalyzing(true);
    setResult(null);
    setWatermarkResult(null);

    try {
      let fileToAnalyze = file;
      // If toggle is ON, embed watermark first
      if (useWatermark) {
        const watermarkedBlob = await api.embedWatermark(file);
        // Convert Blob to File for consistent API usage
        fileToAnalyze = new File([watermarkedBlob], "watermarked.wav", { type: "audio/wav" });
      }
      // Run both analyses in parallel
      const [deepfakeResult, watermarkCheck] = await Promise.all([
        api.detectDeepfake(fileToAnalyze),
        api.detectWatermark(fileToAnalyze),
      ]);

      setResult(deepfakeResult);
      setWatermarkResult(watermarkCheck);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze audio. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        🛡️ DeepFake Defense
      </h1>

      {/* Watermark toggle */}
      <div className="flex items-center justify-center mb-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useWatermark}
            onChange={e => setUseWatermark(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="text-lg">Embed Watermark before analysis</span>
        </label>
      </div>

      <div className="grid gap-6 mb-8">
        <VoiceRecorder onRecordingComplete={analyzeAudio} />
        <FileUpload onFileSelected={analyzeAudio} />
      </div>

      {audioFile && (
        <div className="mb-6">
          <button
            onClick={() => analyzeAudio(audioFile)}
            disabled={analyzing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-bold text-lg transition-colors"
          >
            {analyzing ? "🔍 Analyzing..." : "🔍 Analyze Audio"}
          </button>
        </div>
      )}

      {analyzing && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-xl">Analyzing audio patterns...</p>
        </div>
      )}

      {result && (
        <ResultDisplay result={result} watermarkResult={watermarkResult} />
      )}
    </div>
  );
}
