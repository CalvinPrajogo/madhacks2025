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
  const recorderClearRef = useState({ current: null })[0];
  const uploadClearRef = useState({ current: null })[0];

  const analyzeAudio = async (file, source, url = null) => {
    // Clear the other source
    if (source === 'recorded' && uploadClearRef.current) {
      uploadClearRef.current();
    } else if (source === 'uploaded' && recorderClearRef.current) {
      recorderClearRef.current();
    }
    
    setAudioFile(file);
    setAudioURL(url || (file ? URL.createObjectURL(file) : ""));
    setFileName(source === 'uploaded' ? file.name : "");
    setAudioSource(source);
    setAnalyzing(true);
    setResult(null);
    setWatermarkResult(null);

    try {
      // Run both analyses in parallel
      const [deepfakeResult, watermarkCheck] = await Promise.all([
        api.detectDeepfake(file),
        api.detectWatermark(file),
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
        <span className="font-bold">Phish</span><span className="font-light">Net</span>
      </h1>

      <div className={`flex-grow flex flex-col justify-center ${audioURL ? '-translate-y-12' : 'translate-y-0'} transition-all duration-500`}>
        <div className="relative grid grid-cols-2 gap-8 mb-6 items-center">
        <VoiceRecorder 
          onRecordingComplete={(file, url) => analyzeAudio(file, 'recorded', url)} 
          clearRef={recorderClearRef}
        />
        <div className="absolute left-1/2 -translate-x-1/2 z-10">
          <p className="text-lg uppercase tracking-widest font-dm-sans opacity-80">OR</p>
        </div>
        <FileUpload 
          onFileSelected={(file) => analyzeAudio(file, 'uploaded')} 
          clearRef={uploadClearRef}
        />
      </div>

      {audioURL && (
        <div className="mb-8 bg-white/10 p-6 rounded-lg animate-fade-slide-up">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-dm-sans text-white">
              <span className="font-semibold uppercase tracking-widest">Your {audioSource === 'recorded' ? 'Recorded' : 'Uploaded'} Audio</span>
              {fileName && <span className="font-normal normal-case tracking-normal"> - {fileName}</span>}
            </p>
            <CustomAudioPlayer src={audioURL} />
          </div>
        </div>
      )}

      {audioFile && (
        <div className="mb-6 animate-fade-slide-up">
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
    </div>
  );
}
