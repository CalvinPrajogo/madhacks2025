import { useState, useRef, useEffect } from "react";
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
  const hasAnimatedAudioRef = useRef(false);
  const recorderClearRef = useState({ current: null })[0];
  const uploadClearRef = useState({ current: null })[0];

  const handleAudioReady = (file, source, url = null) => {
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
    setResult(null);
    setWatermarkResult(null);
    hasAnimatedAudioRef.current = false;
  };

  const handleTryDifferentAudio = () => {
    setAudioFile(null);
    setAudioURL("");
    setFileName("");
    setAudioSource(null);
    setAnalyzing(false);
    setResult(null);
    setWatermarkResult(null);
    hasAnimatedAudioRef.current = false;
  };

  const analyzeAudio = async () => {
    if (!audioFile) return;

    setAnalyzing(true);
    setResult(null);
    setWatermarkResult(null);

    try {
      let fileToAnalyze = audioFile;

      // If toggle is ON, embed watermark first
      if (useWatermark) {
        const watermarkedBlob = await api.embedWatermark(audioFile);
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
      <h1 className="text-4xl text-center mb-8 pt-6 flex-shrink-0">
        <span className="font-bold">Phish</span>
        <span className="font-light">Net</span>
      </h1>

      <div className="flex flex-col flex-grow">
        <div
          className={`flex flex-col ${
            audioURL || result ? "" : "min-h-full justify-center"
          } transition-all duration-500`}
        >
        {/* Watermark toggle */}
        {!result && (
          <div className={`flex flex-col items-center justify-center mb-6 flex-shrink-0 gap-2 transition-opacity duration-500 ${analyzing ? 'opacity-0' : 'opacity-100'}`}>
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={useWatermark}
                  onChange={e => setUseWatermark(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-white/60 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-lg font-bold uppercase tracking-widest font-dm-sans">
                Add Watermark
              </span>
            </label>
            <p className="text-sm font-dm-sans font-light text-white/80 text-center max-w-md">
              When active, a silent frequency will be added to your audio to create a unique voice ID.
            </p>
          </div>
        )}

        {!result && (
          <div className={`relative grid grid-cols-2 gap-8 mb-6 items-center transition-opacity duration-500 ${analyzing ? 'opacity-0' : 'opacity-100'}`}>
            <VoiceRecorder
              onRecordingComplete={(file, url) =>
                handleAudioReady(file, "recorded", url)
              }
              clearRef={recorderClearRef}
            />
            <div className="absolute left-1/2 -translate-x-1/2 z-10">
              <p className="text-lg uppercase tracking-widest font-dm-sans opacity-80">
                OR
              </p>
            </div>
            <FileUpload
              onFileSelected={(file) => handleAudioReady(file, "uploaded")}
              clearRef={uploadClearRef}
            />
          </div>
        )}

        {audioURL && !result && (
          <div className={`mb-6 bg-white/10 p-6 rounded-lg transition-opacity duration-500 ${!analyzing ? 'animate-fade-slide-up' : 'opacity-0'}`}>
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

        {audioURL && !result && (
          <div className={`mb-8 flex justify-center transition-opacity duration-500 ${!analyzing ? 'animate-fade-slide-up' : 'opacity-0'}`}>
            <button
              onClick={analyzeAudio}
              className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer"
            >
              Analyze Audio
            </button>
          </div>
        )}

        {result && (
          <>
            <div className="mb-6 bg-white/10 p-6 rounded-lg animate-fade-slide-up">
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
            <div className="animate-fade-slide-up">
              <ResultDisplay result={result} watermarkResult={watermarkResult} />
            </div>
            
            <div className="flex justify-center mt-6" style={{ animation: 'fade-slide-up 0.5s ease-out 0.6s forwards', opacity: 0 }}>
              <button
                onClick={handleTryDifferentAudio}
                className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer"
              >
                Try Different Audio
              </button>
            </div>
          </>
        )}
        </div>
      </div>

      {analyzing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ animation: 'fade-in 0.5s ease-out forwards' }}>
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 30}deg) translateY(-24px)`,
                    animation: `pulse-opacity 1.2s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-xl font-light">Analyzing audio...</p>
        </div>
      )}
    </div>
  );
}
