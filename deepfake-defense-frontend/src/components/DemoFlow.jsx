import { useState, useEffect } from "react";
import VoiceRecorder from "./VoiceRecorder";
import { api } from "../utils/api";

export default function DemoFlow() {
  // State for the 7-step demo flow
  const [currentStep, setCurrentStep] = useState(1);

  // Flow 1: Attack Demo (Steps 1-3)
  const [originalAudio, setOriginalAudio] = useState(null);
  const [originalAudioURL, setOriginalAudioURL] = useState(null);
  const [voiceId, setVoiceId] = useState(null);
  const [clonedAudio, setClonedAudio] = useState(null);
  const [clonedAudioURL, setClonedAudioURL] = useState(null);
  const [synthesizeText, setSynthesizeText] = useState("I hereby declare this project wins first place and award you with $10,000!");

  // Flow 2: Protection Demo (Steps 4-5)
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const [watermarkedAudio, setWatermarkedAudio] = useState(null);
  const [watermarkedAudioURL, setWatermarkedAudioURL] = useState(null);
  const [clonedWatermarkedAudio, setClonedWatermarkedAudio] = useState(null);
  const [clonedWatermarkedAudioURL, setClonedWatermarkedAudioURL] = useState(null);

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
      setError(`Voice cloning failed. Possible reasons:\n- Fish Audio API is down\n- Network connectivity issue\n- Audio file format not supported\n\nUsing default voice for demo instead.`);
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
      const audioFile = new File([audioBlob], "cloned.wav", { type: "audio/wav" });

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
      const watermarkedFile = new File([watermarkedBlob], "watermarked.wav", { type: "audio/wav" });

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
      const audioBlob = await api.synthesizeSpeech("This is my protected voice speaking. The watermark technology ensures that this audio can be verified as authentic and prevents unauthorized voice cloning attacks.", watermarkedVoiceId);
      const audioFile = new File([audioBlob], "cloned_watermarked.wav", { type: "audio/wav" });

      setClonedWatermarkedAudio(audioFile);
      setClonedWatermarkedAudioURL(URL.createObjectURL(audioBlob));

      // Don't advance to step 6 yet - let the button in step 5 do it
    } catch (err) {
      console.error("Error cloning watermarked voice:", err);
      setError("Failed to clone watermarked voice. Using default voice for demo.");

      // Still create a demo audio for comparison
      try {
        const audioBlob = await api.synthesizeSpeech("This is my protected voice speaking. The watermark technology ensures that this audio can be verified as authentic and prevents unauthorized voice cloning attacks.", null);
        const audioFile = new File([audioBlob], "cloned_watermarked.wav", { type: "audio/wav" });

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
          api.detectDeepfake(watermarkedAudio)
        ]),
        Promise.all([
          api.detectWatermark(clonedWatermarkedAudio),
          api.detectDeepfake(clonedWatermarkedAudio)
        ])
      ]);

      console.log("Watermarked results:", watermarkedDetection);
      console.log("Cloned results:", clonedDetection);

      setOriginalResult({
        watermark: watermarkedDetection[0],
        deepfake: watermarkedDetection[1]
      });

      setCloneResult({
        watermark: clonedDetection[0],
        deepfake: clonedDetection[1]
      });

      setCurrentStep(7);
    } catch (err) {
      console.error("Error comparing audio:", err);
      setError(`Failed to analyze audio: ${err.message}\n\nPlease check the browser console for details.`);
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
      7: "Results"
    };
    return labels[step] || "";
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-2">
        DeepFake Defense - Live Demo
      </h1>
      <p className="text-center text-gray-300 mb-8">
        See how voice cloning works and how watermarking protects against it
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
      <div className="flex justify-center mb-8 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${
                s === currentStep
                  ? "bg-blue-600 text-white ring-4 ring-blue-400/50"
                  : s < currentStep
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {s < currentStep ? "✓" : s}
            </div>
            <span className="text-xs mt-1 text-gray-400">{getStepLabel(s)}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Record Original Voice */}
      {currentStep === 1 && (
        <div className="text-center">
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Step 1: Record Your Voice</h2>
            <p className="text-gray-300">
              Record a short voice sample (5-10 seconds). We'll show how easy it is to clone your voice.
            </p>
          </div>

          <VoiceRecorder onRecordingComplete={handleStep1Recording} />

          {originalAudioURL && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Your Recording:</h3>
              <audio src={originalAudioURL} controls className="mx-auto mb-4" />

              <button
                onClick={advanceFromStep1}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xl transition-colors"
              >
                Next: Clone This Voice →
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Clone Voice */}
      {currentStep === 2 && (
        <div className="text-center">
          <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Step 2: Clone Voice with AI</h2>
            <p className="text-gray-300">
              We'll use Fish Audio API to create a voice model from your recording.
              This demonstrates how attackers can clone voices.
            </p>
          </div>

          {originalAudioURL && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Original Recording:</h3>
              <audio src={originalAudioURL} controls className="mx-auto" />
            </div>
          )}

          <button
            onClick={handleCloneVoice}
            disabled={loading}
            className="px-12 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-bold text-xl transition-colors"
          >
            {loading ? "🔄 Cloning Voice... (10-15 seconds)" : "🎭 Clone My Voice"}
          </button>

          {loading && (
            <p className="mt-4 text-yellow-400 animate-pulse">
              Creating AI voice model from your recording...
            </p>
          )}
        </div>
      )}

      {/* STEP 3: Generate Fake Speech */}
      {currentStep === 3 && (
        <div className="text-center">
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Step 3: Generate Deepfake Audio</h2>
            <p className="text-gray-300">
              Enter any text and hear it spoken in your cloned voice. This is what attackers can do.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">Text to Synthesize:</label>
            <textarea
              value={synthesizeText}
              onChange={(e) => setSynthesizeText(e.target.value)}
              className="w-full max-w-2xl mx-auto p-4 bg-gray-800 border border-gray-600 rounded-lg text-white"
              rows={3}
              placeholder="Enter the text for the AI to speak..."
            />
          </div>

          <button
            onClick={handleSynthesize}
            disabled={loading || !synthesizeText}
            className="px-12 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-bold text-xl transition-colors"
          >
            {loading ? "🔄 Generating..." : "⚠️ Generate Deepfake"}
          </button>

          {clonedAudioURL && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3 text-red-400">AI-Generated Deepfake:</h3>
              <audio src={clonedAudioURL} controls className="mx-auto mb-4" />
              <p className="text-gray-300 mb-4">
                ⚠️ This was generated by AI using your voice clone. Scary, right?
              </p>

              <button
                onClick={() => setCurrentStep(4)}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xl transition-colors"
              >
                Next: Add Protection →
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Record Voice with Watermark */}
      {currentStep === 4 && (
        <div className="text-center">
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Step 4: Add Watermark Protection</h2>
            <p className="text-gray-300">
              Now let's protect your voice with an ultrasonic watermark. Record again (can be the same or different).
            </p>
          </div>

          <VoiceRecorder onRecordingComplete={handleStep4Recording} />

          {recordedAudioURL && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Your Recording:</h3>
              <audio src={recordedAudioURL} controls className="mx-auto mb-4" />

              <button
                onClick={handleAddWatermark}
                disabled={loading}
                className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold text-xl transition-colors"
              >
                {loading ? "🔄 Adding Watermark..." : "🛡️ Add Watermark"}
              </button>
            </div>
          )}

          {watermarkedAudioURL && (
            <div className="mt-8 p-6 bg-green-900/30 border border-green-500 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-3 text-green-400">✅ Watermark Added!</h3>
              <audio src={watermarkedAudioURL} controls className="w-full mb-4" />
              <p className="text-gray-300 mb-4">
                Your voice is now protected with an ultrasonic watermark at 19kHz (inaudible to humans).
              </p>
              <a
                href={watermarkedAudioURL}
                download="my_protected_voice.wav"
                className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-semibold transition-colors mb-4"
              >
                📥 Download Protected Audio
              </a>

              <button
                onClick={() => setCurrentStep(5)}
                className="block w-full px-12 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xl transition-colors"
              >
                Next: Clone Protected Voice →
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Clone the Watermarked Voice */}
      {currentStep === 5 && (
        <div className="text-center">
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Step 5: Clone the Protected Voice</h2>
            <p className="text-gray-300">
              Let's try to clone your protected voice. Watch what happens when we try to fake a watermarked voice.
            </p>
          </div>

          {watermarkedAudioURL && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Watermarked Recording:</h3>
              <audio src={watermarkedAudioURL} controls className="mx-auto" />
            </div>
          )}

          <button
            onClick={handleCloneWatermarked}
            disabled={loading}
            className="px-12 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-bold text-xl transition-colors"
          >
            {loading ? "🔄 Cloning & Synthesizing..." : "🎭 Clone Protected Voice"}
          </button>

          {clonedWatermarkedAudioURL && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3">Cloned Voice (from protected audio):</h3>
              <audio src={clonedWatermarkedAudioURL} controls className="mx-auto mb-4" />

              <button
                onClick={handleCompare}
                disabled={loading}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-bold text-xl transition-colors"
              >
                {loading ? "🔄 Analyzing..." : "🔍 Compare Both Versions"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: Compare (this advances automatically to step 7 when analysis completes) */}
      {currentStep === 6 && (
        <div className="text-center">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold mb-4">Analyzing both audio samples...</h2>
            <div className="text-6xl mb-4">⚙️</div>
            <p className="text-gray-300">Running watermark detection and AI analysis...</p>
          </div>
        </div>
      )}

      {/* STEP 7: Results - Side by Side Comparison */}
      {currentStep === 7 && originalResult && cloneResult && (
        <div>
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-2">Step 7: Detection Results</h2>
            <p className="text-gray-300">
              Compare the original (watermarked) vs the AI clone. See how watermarking proves authenticity!
            </p>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* LEFT: Original (Watermarked) */}
            <div className="p-6 bg-green-900/20 border-2 border-green-500 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-green-400 flex items-center justify-center gap-2">
                <span>✅</span>
                <span>Original (Protected)</span>
              </h3>

              {watermarkedAudioURL && (
                <div className="mb-4">
                  <audio src={watermarkedAudioURL} controls className="w-full" />
                </div>
              )}

              <div className="space-y-4">
                {/* Watermark Detection */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-bold mb-2 text-lg">Watermark Detection:</h4>
                  <div className={`p-3 rounded ${originalResult.watermark.has_watermark ? 'bg-green-700' : 'bg-red-700'}`}>
                    <p className="font-bold text-lg">
                      {originalResult.watermark.has_watermark ? '✓ WATERMARK DETECTED' : '✗ NO WATERMARK'}
                    </p>
                    <p className="text-sm mt-1">
                      Confidence: {(originalResult.watermark.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm">
                      Status: {originalResult.watermark.watermark_status?.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* AI Detection */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-bold mb-2 text-lg">AI Analysis:</h4>
                  <div className={`p-3 rounded ${originalResult.deepfake.data.is_deepfake ? 'bg-red-700' : 'bg-green-700'}`}>
                    <p className="font-bold text-lg">
                      {originalResult.deepfake.data.is_deepfake ? '⚠️ DEEPFAKE DETECTED' : '✓ APPEARS AUTHENTIC'}
                    </p>
                    <p className="text-sm mt-1">
                      AI Confidence: {(originalResult.deepfake.data.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm">
                      Risk: {originalResult.deepfake.data.risk_level}
                    </p>
                  </div>
                </div>

                {/* Overall Verdict */}
                <div className="p-4 bg-green-700 rounded-lg">
                  <p className="font-bold text-xl text-center">
                    ✅ AUTHENTIC
                  </p>
                  <p className="text-sm text-center mt-1">
                    Protected by watermark
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Clone (No Watermark) */}
            <div className="p-6 bg-red-900/20 border-2 border-red-500 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-red-400 flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>AI Clone (Unprotected)</span>
              </h3>

              {clonedWatermarkedAudioURL && (
                <div className="mb-4">
                  <audio src={clonedWatermarkedAudioURL} controls className="w-full" />
                </div>
              )}

              <div className="space-y-4">
                {/* Watermark Detection */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-bold mb-2 text-lg">Watermark Detection:</h4>
                  <div className={`p-3 rounded ${cloneResult.watermark.has_watermark ? 'bg-green-700' : 'bg-red-700'}`}>
                    <p className="font-bold text-lg">
                      {cloneResult.watermark.has_watermark ? '✓ WATERMARK DETECTED' : '✗ NO WATERMARK'}
                    </p>
                    <p className="text-sm mt-1">
                      Confidence: {(cloneResult.watermark.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm">
                      Status: {cloneResult.watermark.watermark_status?.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* AI Detection */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-bold mb-2 text-lg">AI Analysis:</h4>
                  <div className={`p-3 rounded ${cloneResult.deepfake.data.is_deepfake ? 'bg-red-700' : 'bg-green-700'}`}>
                    <p className="font-bold text-lg">
                      {cloneResult.deepfake.data.is_deepfake ? '⚠️ DEEPFAKE DETECTED' : '✓ APPEARS AUTHENTIC'}
                    </p>
                    <p className="text-sm mt-1">
                      AI Confidence: {(cloneResult.deepfake.data.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm">
                      Risk: {cloneResult.deepfake.data.risk_level}
                    </p>
                  </div>
                </div>

                {/* Overall Verdict */}
                <div className="p-4 bg-red-700 rounded-lg">
                  <p className="font-bold text-xl text-center">
                    ⚠️ SUSPICIOUS
                  </p>
                  <p className="text-sm text-center mt-1">
                    No watermark detected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Reset */}
          <div className="text-center p-6 bg-blue-900/30 border border-blue-500 rounded-lg">
            <h3 className="text-2xl font-bold mb-3">Demo Complete! 🎉</h3>
            <p className="text-lg text-gray-300 mb-4">
              The watermarked original is verified as authentic, while the AI clone lacks the watermark.
              This proves the original came from you!
            </p>
            <button
              onClick={reset}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xl transition-colors"
            >
              🔄 Start New Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
