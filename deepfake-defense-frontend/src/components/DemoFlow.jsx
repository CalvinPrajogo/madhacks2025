import { useState, useEffect } from "react";
import VoiceRecorder from "./VoiceRecorder";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { api } from "../utils/api";
import authenticIcon from "../assets/authentic_2px.png";
import notAuthenticIcon from "../assets/not_authentic_2px.png";
import lowRiskIcon from "../assets/low_risk_2px.png";
import riskMediumIcon from "../assets/risk_medium_2px.png";
import riskHighIcon from "../assets/risk_high_2px.png";
import watermarkDetectedIcon from "../assets/watermark_detected_2px.png";
import noWatermarkIcon from "../assets/no_watermark_2px.png";

export default function DemoFlow() {
  // State for the 7-step demo flow
  const [currentStep, setCurrentStep] = useState(1);

  // Flow 1: Attack Demo (Steps 1-3)
  const [originalAudio, setOriginalAudio] = useState(null);
  const [originalAudioURL, setOriginalAudioURL] = useState(null);
  const [voiceId, setVoiceId] = useState(null);
  const [clonedAudio, setClonedAudio] = useState(null);
  const [clonedAudioURL, setClonedAudioURL] = useState(null);
  const [synthesizeText, setSynthesizeText] = useState(
    "I hereby declare this project wins first place and award you with $10,000!"
  );

  // Flow 2: Protection Demo (Steps 4-5)
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const [watermarkedAudio, setWatermarkedAudio] = useState(null);
  const [watermarkedAudioURL, setWatermarkedAudioURL] = useState(null);
  const [clonedWatermarkedAudio, setClonedWatermarkedAudio] = useState(null);
  const [clonedWatermarkedAudioURL, setClonedWatermarkedAudioURL] =
    useState(null);

  // Flow 3: Comparison (Step 6)
  const [originalResult, setOriginalResult] = useState(null);
  const [cloneResult, setCloneResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonStarted, setComparisonStarted] = useState(false);

  // Step 1: Record Original Voice
  const handleStep1Recording = (audioFile) => {
    setOriginalAudio(audioFile);
    setOriginalAudioURL(URL.createObjectURL(audioFile));
    setError(null);
  };

  const advanceFromStep1 = () => {
    if (!originalAudio) {
      setError("Please record your voice first");
      return;
    }
    setCurrentStep(2);
  };

  // Step 2: Clone Voice with Fish Audio
  const handleCloneVoice = async () => {
    if (!originalAudio) return;

    setError(null);
    setLoading(true);

    try {
      const cloneResponse = await api.cloneVoice(originalAudio);
      console.log("Voice cloned:", cloneResponse);

      if (cloneResponse.data && cloneResponse.data.voice_id) {
        setVoiceId(cloneResponse.data.voice_id);
        setCurrentStep(3);
      } else {
        throw new Error("Voice ID not returned from API");
      }
    } catch (err) {
      console.error("Error cloning voice:", err);
      setError(
        `Voice cloning failed. Possible reasons:\n- Fish Audio API is down\n- Network connectivity issue\n- Audio file format not supported\n\nUsing default voice for demo instead.`
      );
      // Allow continuing with default voice
      setVoiceId(null);
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Generate Fake Speech
  const handleSynthesize = async () => {
    if (!synthesizeText) {
      setError("Please enter text to synthesize");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      console.log("Synthesizing text:", synthesizeText);
      console.log("Using voice ID:", voiceId);

      const audioBlob = await api.synthesizeSpeech(synthesizeText, voiceId);
      const audioFile = new File([audioBlob], "cloned.wav", {
        type: "audio/wav",
      });

      setClonedAudio(audioFile);
      setClonedAudioURL(URL.createObjectURL(audioBlob));

      console.log("Synthesis complete, audio created");

      // Don't auto-advance - let user listen to the deepfake first
    } catch (err) {
      console.error("Error synthesizing speech:", err);
      setError(`Speech synthesis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Record Voice with Watermark
  const handleStep4Recording = (audioFile) => {
    setRecordedAudio(audioFile);
    setRecordedAudioURL(URL.createObjectURL(audioFile));
    setError(null);
  };

  const handleAddWatermark = async () => {
    if (!recordedAudio) {
      setError("Please record audio first");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const watermarkedBlob = await api.embedWatermark(recordedAudio);
      const watermarkedFile = new File([watermarkedBlob], "watermarked.wav", {
        type: "audio/wav",
      });

      setWatermarkedAudio(watermarkedFile);
      setWatermarkedAudioURL(URL.createObjectURL(watermarkedBlob));

      setCurrentStep(5);
    } catch (err) {
      console.error("Error adding watermark:", err);
      setError("Failed to add watermark. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Clone the Watermarked Voice
  const handleCloneWatermarked = async () => {
    if (!watermarkedAudio) return;

    setError(null);
    setLoading(true);

    try {
      // Clone the watermarked voice
      const cloneResponse = await api.cloneVoice(watermarkedAudio);
      const watermarkedVoiceId = cloneResponse.data?.voice_id || null;

      // Synthesize speech with the cloned watermarked voice (longer text for better analysis)
      const audioBlob = await api.synthesizeSpeech(
        "This is my protected voice speaking. The watermark technology ensures that this audio can be verified as authentic and prevents unauthorized voice cloning attacks.",
        watermarkedVoiceId
      );
      const audioFile = new File([audioBlob], "cloned_watermarked.wav", {
        type: "audio/wav",
      });

      setClonedWatermarkedAudio(audioFile);
      setClonedWatermarkedAudioURL(URL.createObjectURL(audioBlob));

      // Don't advance to step 6 yet - let the button in step 5 do it
    } catch (err) {
      console.error("Error cloning watermarked voice:", err);
      setError(
        "Failed to clone watermarked voice. Using default voice for demo."
      );

      // Still create a demo audio for comparison
      try {
        const audioBlob = await api.synthesizeSpeech(
          "This is my protected voice speaking. The watermark technology ensures that this audio can be verified as authentic and prevents unauthorized voice cloning attacks.",
          null
        );
        const audioFile = new File([audioBlob], "cloned_watermarked.wav", {
          type: "audio/wav",
        });

        setClonedWatermarkedAudio(audioFile);
        setClonedWatermarkedAudioURL(URL.createObjectURL(audioBlob));
      } catch (err2) {
        console.error("Error generating demo audio:", err2);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Compare Both Versions
  const handleCompare = async () => {
    if (!watermarkedAudio || !clonedWatermarkedAudio) {
      setError("Missing audio files for comparison");
      return;
    }

    if (comparisonStarted) return; // Prevent double execution

    setError(null);
    setLoading(true);
    setComparisonStarted(true);
    setCurrentStep(6); // Move to loading screen

    try {
      console.log("Starting comparison...");

      // Detect both versions in parallel
      const [watermarkedDetection, clonedDetection] = await Promise.all([
        Promise.all([
          api.detectWatermark(watermarkedAudio),
          api.detectDeepfake(watermarkedAudio),
        ]),
        Promise.all([
          api.detectWatermark(clonedWatermarkedAudio),
          api.detectDeepfake(clonedWatermarkedAudio),
        ]),
      ]);

      console.log("Watermarked results:", watermarkedDetection);
      console.log("Cloned results:", clonedDetection);

      setOriginalResult({
        watermark: watermarkedDetection[0],
        deepfake: watermarkedDetection[1],
      });

      setCloneResult({
        watermark: clonedDetection[0],
        deepfake: clonedDetection[1],
      });

      // Stay on step 6, results will show automatically
    } catch (err) {
      console.error("Error comparing audio:", err);
      setError(
        `Failed to analyze audio: ${err.message}\n\nPlease check the browser console for details.`
      );
      setCurrentStep(5); // Go back to step 5
      setComparisonStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCurrentStep(1);
    setOriginalAudio(null);
    setOriginalAudioURL(null);
    setVoiceId(null);
    setClonedAudio(null);
    setClonedAudioURL(null);
    setRecordedAudio(null);
    setRecordedAudioURL(null);
    setWatermarkedAudio(null);
    setWatermarkedAudioURL(null);
    setClonedWatermarkedAudio(null);
    setClonedWatermarkedAudioURL(null);
    setOriginalResult(null);
    setCloneResult(null);
    setError(null);
    setComparisonStarted(false);
  };

  const getStepLabel = (step) => {
    const labels = {
      1: "Record Original",
      2: "Clone Voice",
      3: "Generate Fake",
      4: "Add Protection",
      5: "Clone Protected",
      6: "Compare",
      7: "Results",
    };
    return labels[step] || "";
  };

  return (
    <div className="mx-auto p-6">
      <p className="text-center text-gray-300 mb-8 font-light">
        See how <span className="font-bold">voice cloning</span> works and how{" "}
        <span className="font-bold">watermarking</span> protects against it.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-200 whitespace-pre-line">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Indicator */}
      <div className="absolute left-0 right-0">
        {/* Circles and Lines */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-center w-full">
            {[1, 2, 3, 4, 5, 6].map((s, index) => (
              <div
                key={s}
                className={`flex items-center ${index < 5 ? "flex-1" : ""}`}
              >
                {/* Circle */}
                <div
                  className={`w-3 h-3 rounded-full transition-opacity duration-500 flex-shrink-0 ${
                    s <= currentStep
                      ? "bg-white opacity-100"
                      : "bg-white opacity-40"
                  }`}
                />
                {/* Line between circles (not after last circle) */}
                {index < 5 && (
                  <div className="h-[2px] flex-1 relative">
                    {/* Base line (40% opacity) */}
                    <div className="absolute inset-0 bg-white opacity-40" />
                    {/* Filled line (100% opacity, animates from left) */}
                    <div
                      className="absolute inset-0 bg-white opacity-100 origin-left transition-transform duration-700 ease-out"
                      style={{
                        transform: currentStep > s ? "scaleX(1)" : "scaleX(0)",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Label positioned under current circle */}
        {currentStep && (
          <div className="flex justify-between items-center w-[860px] max-w-full mx-auto mt-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="w-24 text-center flex-shrink-0">
                {s === currentStep && (
                  <p className="text-sm font-dm-sans font-semibold uppercase tracking-widest whitespace-nowrap">
                    STEP {currentStep > 6 ? 6 : currentStep}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="h-[60px]" />

      {/* STEP 1: Record Original Voice */}
      {currentStep === 1 && (
        <div className="relative">
          {!originalAudioURL ? (
            <div className="mb-6 p-6 bg-white/10 rounded-lg max-w-3xl mx-auto text-center">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-4">
                Record Your Voice
              </h2>
              <p className="text-gray-300 font-light">
                Record a short voice sample (5-10 seconds). We'll show how easy
                it is to clone your voice.
              </p>
            </div>
          ) : (
            <div className="h-0 overflow-hidden transition-all duration-500 max-w-3xl mx-auto" />
          )}

          <div className={originalAudioURL ? "-mt-6" : ""}>
            <VoiceRecorder onRecordingComplete={handleStep1Recording} />

            {originalAudioURL && (
              <div className="mt-6 animate-fade-slide-up max-w-3xl mx-auto">
                <div className="bg-white/10 p-6 rounded-lg mb-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-dm-sans text-white">
                      <span className="font-semibold uppercase tracking-widest">
                        Your Recorded Audio
                      </span>
                    </p>
                    <CustomAudioPlayer src={originalAudioURL} />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={advanceFromStep1}
                    className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Clone Voice */}
      {currentStep === 2 && (
        <div className="animate-fade-in">
          <div className="mb-6 p-6 bg-white/10 rounded-lg max-w-3xl mx-auto text-center">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4">
              Clone Voice with AI
            </h2>
            <p className="text-gray-300 font-light">
              We'll use Fish Audio API to create a voice model from your
              recording. This demonstrates how attackers can clone voices.
            </p>
          </div>

          {originalAudioURL && (
            <div className="mb-6 max-w-3xl mx-auto">
              <div className="bg-white/10 p-6 rounded-lg">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-dm-sans text-white">
                    <span className="font-semibold uppercase tracking-widest">
                      Your Original Recording
                    </span>
                  </p>
                  <CustomAudioPlayer src={originalAudioURL} />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleCloneVoice}
              disabled={loading}
              className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Cloning Voice..." : "Clone Voice"}
            </button>
          </div>

          {loading && (
            <p className="mt-4 text-white/80 font-light animate-pulse text-center">
              Creating AI voice model from your recording...
            </p>
          )}
        </div>
      )}

      {/* STEP 3: Generate Fake Speech */}
      {currentStep === 3 && (
        <div className="animate-fade-in">
          <div className="mb-6 p-6 bg-white/10 rounded-lg max-w-3xl mx-auto text-center">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4">
              Generate Deepfake Audio
            </h2>
            <p className="text-gray-300 font-light">
              Enter any text and hear it spoken in your cloned voice. This is
              what attackers can do.
            </p>
          </div>

          <div className="mb-6 max-w-3xl mx-auto">
            <input
              type="text"
              value={synthesizeText}
              onChange={(e) => setSynthesizeText(e.target.value)}
              className="w-full p-4 bg-white/10 rounded-lg text-white font-light outline-none border-2 border-white"
              placeholder="I hereby declare this project wins first place and award you with $10,000!"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSynthesize}
              disabled={loading || !synthesizeText}
              className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Deepfake"}
            </button>
          </div>

          {clonedAudioURL && (
            <div className="mt-8 animate-fade-slide-up max-w-3xl mx-auto">
              <div className="bg-white/10 p-6 rounded-lg mb-6">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-dm-sans text-white">
                    <span className="font-semibold uppercase tracking-widest">
                      AI-Generated Deepfake
                    </span>
                  </p>
                  <CustomAudioPlayer src={clonedAudioURL} />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer"
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Record Voice with Watermark */}
      {currentStep === 4 && (
        <div className="animate-fade-in">
          {!recordedAudioURL ? (
            <div className="mb-6 p-6 bg-white/10 rounded-lg max-w-3xl mx-auto text-center transition-all duration-500">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-4">
                Add Watermark Protection
              </h2>
              <p className="text-gray-300 font-light">
                Now let's protect your voice with an ultrasonic watermark.
                Record again (can be the same or different).
              </p>
            </div>
          ) : (
            <div className="h-0 overflow-hidden mb-6 max-w-3xl mx-auto transition-all duration-500"></div>
          )}

          <div className={recordedAudioURL ? "-mt-6" : ""}>
            <VoiceRecorder onRecordingComplete={handleStep4Recording} />
          </div>

          {recordedAudioURL && (
            <div className="mt-6 animate-fade-slide-up max-w-3xl mx-auto">
              <div className="bg-white/10 p-6 rounded-lg mb-6">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-dm-sans text-white">
                    <span className="font-semibold uppercase tracking-widest">
                      Your Recorded Audio
                    </span>
                  </p>
                  <CustomAudioPlayer src={recordedAudioURL} />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleAddWatermark}
                  disabled={loading}
                  className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding Watermark..." : "Add Watermark"}
                </button>
              </div>
            </div>
          )}

          {watermarkedAudioURL && (
            <div className="mt-8 max-w-3xl mx-auto animate-fade-slide-up">
              <div className="bg-white/10 p-6 rounded-lg mb-6">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-dm-sans text-white">
                    <span className="font-semibold uppercase tracking-widest">
                      Watermarked Audio
                    </span>
                  </p>
                  <CustomAudioPlayer src={watermarkedAudioURL} />
                </div>
              </div>
              <p className="text-gray-300 font-light mb-6 text-center">
                Your voice is now protected with an ultrasonic watermark at
                21kHz (inaudible to humans).
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Next: Clone Protected Voice →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Clone the Watermarked Audio */}
      {currentStep === 5 && (
        <div className="animate-fade-in">
          <div className="mb-6 p-6 bg-white/10 rounded-lg max-w-3xl mx-auto text-center">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4">
              Clone the Protected Voice
            </h2>
            <p className="text-gray-300 font-light">
              Let's try to clone your protected voice. Watch what happens when
              we try to fake a watermarked voice.
            </p>
          </div>

          {watermarkedAudioURL && (
            <div className="mb-6 max-w-3xl mx-auto">
              <div className="bg-white/10 p-6 rounded-lg">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-dm-sans text-white">
                    <span className="font-semibold uppercase tracking-widest">
                      Your Watermarked Recording
                    </span>
                  </p>
                  <CustomAudioPlayer src={watermarkedAudioURL} />
                </div>
              </div>
            </div>
          )}

          {!clonedWatermarkedAudioURL ? (
            <div className="flex justify-center transition-all duration-500">
              <button
                onClick={handleCloneWatermarked}
                disabled={loading}
                className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Cloning & Synthesizing..."
                  : "Clone Protected Voice"}
              </button>
            </div>
          ) : (
            <div className="h-0 overflow-hidden transition-all duration-500" />
          )}

          {clonedWatermarkedAudioURL && (
            <div className="animate-fade-slide-up max-w-3xl mx-auto">
              <div className="bg-white/10 p-6 rounded-lg mb-6">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-dm-sans text-white">
                    <span className="font-semibold uppercase tracking-widest">
                      Cloned Voice
                    </span>
                  </p>
                  <CustomAudioPlayer src={clonedWatermarkedAudioURL} />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleCompare}
                  disabled={loading}
                  className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Analyzing..." : "Compare Both Versions"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: Results */}
      {currentStep === 6 && (
        <div className="animate-fade-in">
          {!originalResult || !cloneResult ? (
            <div className="text-center">
              <div className="animate-pulse">
                <h2 className="text-2xl font-bold mb-4">
                  Analyzing both audio samples...
                </h2>
                <div className="text-6xl mb-4">⚙️</div>
                <p className="text-gray-300">
                  Running watermark detection and AI analysis...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Side by Side Comparison */}
              <div className="grid md:grid-cols-2 gap-6 mb-6 max-w-4xl mx-auto">
                {/* LEFT: Original (Watermarked) */}
                <div className="bg-white/10 p-6 rounded-lg">
                  <h2 className="text-lg font-bold uppercase tracking-widest font-dm-sans mb-6 text-center">
                    Original (Protected)
                  </h2>

                  {watermarkedAudioURL && (
                    <div className="mb-6">
                      <CustomAudioPlayer src={watermarkedAudioURL} />
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-8">
                    {/* Risk Level */}
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={
                          originalResult.deepfake.data.risk_level === "HIGH"
                            ? riskHighIcon
                            : originalResult.deepfake.data.risk_level ===
                              "MEDIUM"
                            ? riskMediumIcon
                            : lowRiskIcon
                        }
                        alt="Risk"
                        className={`w-[120px] h-[120px] ${
                          originalResult.deepfake.data.risk_level === "HIGH"
                            ? "animate-pulse-scale"
                            : originalResult.deepfake.data.risk_level ===
                              "MEDIUM"
                            ? "animate-vibrate"
                            : ""
                        }`}
                      />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
                          Risk Level
                        </p>
                        <p className="text-sm font-dm-sans font-light text-white/80">
                          {originalResult.deepfake.data.risk_level === "HIGH"
                            ? "High"
                            : originalResult.deepfake.data.risk_level ===
                              "MEDIUM"
                            ? "Medium"
                            : originalResult.deepfake.data.risk_level === "LOW"
                            ? "Low"
                            : originalResult.deepfake.data.risk_level}{" "}
                          -{" "}
                          <span className="font-bold">
                            {(
                              originalResult.deepfake.data.confidence * 100
                            ).toFixed(1)}
                            %
                          </span>{" "}
                          confidence
                        </p>
                      </div>
                    </div>

                    {/* Watermark Status */}
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={
                          originalResult.watermark.has_watermark
                            ? watermarkDetectedIcon
                            : noWatermarkIcon
                        }
                        alt="Watermark"
                        className={`w-[120px] h-[120px] ${
                          !originalResult.watermark.has_watermark
                            ? "animate-pulse-scale"
                            : ""
                        }`}
                      />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
                          Watermark
                        </p>
                        <p className="text-sm font-dm-sans font-light text-white/80">
                          {originalResult.watermark.has_watermark
                            ? "Watermark detected"
                            : "No watermark detected"}
                        </p>
                      </div>
                    </div>

                    {/* Voice Authenticity */}
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={
                          originalResult.deepfake.data.is_deepfake
                            ? notAuthenticIcon
                            : authenticIcon
                        }
                        alt={
                          originalResult.deepfake.data.is_deepfake
                            ? "Not Authentic"
                            : "Authentic"
                        }
                        className={`w-[120px] h-[120px] ${
                          originalResult.deepfake.data.is_deepfake
                            ? "animate-pulse-scale"
                            : ""
                        }`}
                      />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
                          Voice Authenticity
                        </p>
                        <p className="text-sm font-dm-sans font-light text-white/80">
                          {originalResult.deepfake.data.is_deepfake
                            ? "Not authentic"
                            : "Authentic"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Clone (No Watermark) */}
                <div className="bg-white/10 p-6 rounded-lg">
                  <h2 className="text-lg font-bold uppercase tracking-widest font-dm-sans mb-6 text-center">
                    AI Clone (Unprotected)
                  </h2>

                  {clonedWatermarkedAudioURL && (
                    <div className="mb-6">
                      <CustomAudioPlayer src={clonedWatermarkedAudioURL} />
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-8">
                    {/* Risk Level */}
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={
                          cloneResult.deepfake.data.risk_level === "HIGH"
                            ? riskHighIcon
                            : cloneResult.deepfake.data.risk_level === "MEDIUM"
                            ? riskMediumIcon
                            : lowRiskIcon
                        }
                        alt="Risk"
                        className={`w-[120px] h-[120px] ${
                          cloneResult.deepfake.data.risk_level === "HIGH"
                            ? "animate-pulse-scale"
                            : cloneResult.deepfake.data.risk_level === "MEDIUM"
                            ? "animate-vibrate"
                            : ""
                        }`}
                      />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
                          Risk Level
                        </p>
                        <p className="text-sm font-dm-sans font-light text-white/80">
                          {cloneResult.deepfake.data.risk_level === "HIGH"
                            ? "High"
                            : cloneResult.deepfake.data.risk_level === "MEDIUM"
                            ? "Medium"
                            : cloneResult.deepfake.data.risk_level === "LOW"
                            ? "Low"
                            : cloneResult.deepfake.data.risk_level}{" "}
                          -{" "}
                          <span className="font-bold">
                            {(
                              cloneResult.deepfake.data.confidence * 100
                            ).toFixed(1)}
                            %
                          </span>{" "}
                          confidence
                        </p>
                      </div>
                    </div>

                    {/* Watermark Status */}
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={
                          cloneResult.watermark.has_watermark
                            ? watermarkDetectedIcon
                            : noWatermarkIcon
                        }
                        alt="Watermark"
                        className={`w-[120px] h-[120px] ${
                          !cloneResult.watermark.has_watermark
                            ? "animate-pulse-scale"
                            : ""
                        }`}
                      />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
                          Watermark
                        </p>
                        <p className="text-sm font-dm-sans font-light text-white/80">
                          {cloneResult.watermark.has_watermark
                            ? "Watermark detected"
                            : "No watermark detected"}
                        </p>
                      </div>
                    </div>

                    {/* Voice Authenticity */}
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={
                          cloneResult.deepfake.data.is_deepfake
                            ? notAuthenticIcon
                            : authenticIcon
                        }
                        alt={
                          cloneResult.deepfake.data.is_deepfake
                            ? "Not Authentic"
                            : "Authentic"
                        }
                        className={`w-[120px] h-[120px] ${
                          cloneResult.deepfake.data.is_deepfake
                            ? "animate-pulse-scale"
                            : ""
                        }`}
                      />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest font-dm-sans mb-1">
                          Voice Authenticity
                        </p>
                        <p className="text-sm font-dm-sans font-light text-white/80">
                          {cloneResult.deepfake.data.is_deepfake
                            ? "Not authentic"
                            : "Authentic"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary & Reset */}
              <div className="text-center bg-white/10 p-6 rounded-lg max-w-4xl mx-auto">
                <h3 className="text-xl font-bold uppercase tracking-widest font-dm-sans mb-3">
                  Demo Complete!
                </h3>
                <p className="text-sm font-dm-sans font-light text-white/80 mb-6">
                  The watermarked original is verified as authentic, while the
                  AI clone lacks the watermark. This proves the original came
                  from you!
                </p>
                <button
                  onClick={reset}
                  className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold uppercase tracking-widest font-dm-sans hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Start New Demo
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
