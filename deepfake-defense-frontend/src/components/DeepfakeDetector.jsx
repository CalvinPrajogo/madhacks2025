import { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";
import FileUpload from "./FileUpload";
import ResultDisplay from "./ResultDisplay";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { api } from "../utils/api";

export default function DeepfakeDetector() {
  const [audioFile, setAudioFile] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [fileName, setFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [watermarkResult, setWatermarkResult] = useState(null);
  const [audioSource, setAudioSource] = useState(null); // 'recorded' or 'uploaded'
  const [useWatermark, setUseWatermark] = useState(false);
  const recorderClearRef = useState({ current: null })[0];
  const uploadClearRef = useState({ current: null })[0];

  const analyzeAudio = async (file, source, url = null) => {
    // Clear the other source
    if (source === "recorded" && uploadClearRef.current) {
      uploadClearRef.current();
    } else if (source === "uploaded" && recorderClearRef.current) {
      recorderClearRef.current();
    }

    setAudioFile(file);
    setAudioURL(url || (file ? URL.createObjectURL(file) : ""));
    setFileName(source === "uploaded" ? file.name : "");
    setAudioSource(source);
    setAnalyzing(true);
    setResult(null);
    setWatermarkResult(null);

    try {
      let fileToAnalyze = file;

      // If toggle is ON, embed watermark first
      if (useWatermark) {
        const watermarkedBlob = await api.embedWatermark(file);
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
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col">
      <h1 className="text-4xl text-center mb-8 pt-6">
        <span className="font-bold">Phish</span>
        <span className="font-light">Net</span>
      </h1>

      <div
        className={`flex-grow flex flex-col justify-center ${
          audioURL ? "-translate-y-12" : "translate-y-0"
        } transition-all duration-500`}
      >
        {/* Watermark toggle */}
        <div className="flex items-center justify-center mb-6">
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={useWatermark}
                onChange={e => setUseWatermark(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="text-lg font-dm-sans uppercase tracking-wide group-hover:text-green-400 transition-colors">
              {useWatermark ? "🛡️ Watermark Enabled" : "Watermark Disabled"}
            </span>
          </label>
        </div>

        <div className="relative grid grid-cols-2 gap-8 mb-6 items-center">
          <VoiceRecorder
            onRecordingComplete={(file, url) =>
              analyzeAudio(file, "recorded", url)
            }
            clearRef={recorderClearRef}
          />
          <div className="absolute left-1/2 -translate-x-1/2 z-10">
            <p className="text-lg uppercase tracking-widest font-dm-sans opacity-80">
              OR
            </p>
          </div>
          <FileUpload
            onFileSelected={(file) => analyzeAudio(file, "uploaded")}
            clearRef={uploadClearRef}
          />
        </div>

        {audioURL && (
          <div className="mb-8 bg-white/10 p-6 rounded-lg animate-fade-slide-up">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-dm-sans text-white">
                <span className="font-semibold uppercase tracking-widest">
                  Your {audioSource === "recorded" ? "Recorded" : "Uploaded"}{" "}
                  Audio
                </span>
                {fileName && (
                  <span className="font-normal normal-case tracking-normal">
                    {" "}
                    - {fileName}
                  </span>
                )}
              </p>
              <CustomAudioPlayer src={audioURL} />
            </div>
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
    </div>
  );
}
