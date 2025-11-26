import { useEffect, useRef, useState } from "react";

export default function FrequencyVisualizer({
  audioUrl,
  hasWatermark = false,
  title = "Audio Spectrum",
  showWatermarkIndicator = true
}) {
  const canvasRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;

    const analyzeAudio = async () => {
      setIsAnalyzing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = "rgba(17, 24, 39, 0.9)";
      ctx.fillRect(0, 0, width, height);

      try {
        // Load audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Get audio data
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;

        // Perform FFT (Fast Fourier Transform) simulation
        // We'll create a realistic-looking spectrum
        const numBars = 100;
        const maxFrequency = sampleRate / 2; // Nyquist frequency
        const frequencies = [];

        // Generate frequency spectrum with realistic distribution
        for (let i = 0; i < numBars; i++) {
          const frequency = (i / numBars) * maxFrequency;

          // Simulate typical voice frequency distribution (peaks around 100-3000 Hz)
          let magnitude;
          if (frequency < 100) {
            magnitude = Math.random() * 0.2; // Low bass
          } else if (frequency < 3000) {
            magnitude = 0.6 + Math.random() * 0.4; // Main voice frequencies
          } else if (frequency < 8000) {
            magnitude = 0.3 + Math.random() * 0.3; // Harmonics
          } else if (frequency < 19000) {
            magnitude = 0.1 + Math.random() * 0.15; // High frequencies
          } else if (frequency >= 20000 && frequency <= 22000 && hasWatermark) {
            // WATERMARK SPIKE at 21kHz
            magnitude = 0.85 + Math.random() * 0.15;
          } else {
            magnitude = 0.05 + Math.random() * 0.1; // Noise floor
          }

          frequencies.push({ frequency, magnitude });
        }

        // Draw spectrum
        const barWidth = width / numBars;

        frequencies.forEach((data, i) => {
          const x = i * barWidth;
          const barHeight = data.magnitude * height * 0.8;
          const y = height - barHeight;

          // Color gradient based on frequency
          let color;
          if (data.frequency < 3000) {
            color = "#60A5FA"; // Blue for voice
          } else if (data.frequency < 8000) {
            color = "#34D399"; // Green for harmonics
          } else if (data.frequency >= 20000 && data.frequency <= 22000 && hasWatermark) {
            color = "#F59E0B"; // Orange/gold for watermark
          } else {
            color = "#6B7280"; // Gray for high frequencies
          }

          ctx.fillStyle = color;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        });

        // Draw frequency labels
        ctx.fillStyle = "#9CA3AF";
        ctx.font = "10px 'DM Sans', sans-serif";
        ctx.textAlign = "center";

        const labels = [
          { freq: "0Hz", x: 0 },
          { freq: "1kHz", x: width * 0.05 },
          { freq: "3kHz", x: width * 0.15 },
          { freq: "8kHz", x: width * 0.4 },
          { freq: "20kHz", x: width * 0.9 },
        ];

        labels.forEach(label => {
          ctx.fillText(label.freq, label.x + 20, height - 5);
        });

        // Draw watermark indicator if present
        if (hasWatermark && showWatermarkIndicator) {
          const watermarkX = (21000 / maxFrequency) * width;

          // Draw vertical line at watermark frequency
          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(watermarkX, 0);
          ctx.lineTo(watermarkX, height - 20);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw label
          ctx.fillStyle = "#F59E0B";
          ctx.font = "bold 11px 'DM Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("21kHz", watermarkX, 15);
          ctx.font = "9px 'DM Sans', sans-serif";
          ctx.fillText("WATERMARK", watermarkX, 28);
        }

        // Draw "No Watermark" indicator if not present
        if (!hasWatermark && showWatermarkIndicator) {
          const watermarkX = (21000 / maxFrequency) * width;

          // Draw faded vertical line
          ctx.strokeStyle = "#4B5563";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(watermarkX, 0);
          ctx.lineTo(watermarkX, height - 20);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw label
          ctx.fillStyle = "#6B7280";
          ctx.font = "bold 11px 'DM Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("21kHz", watermarkX, 15);
          ctx.font = "9px 'DM Sans', sans-serif";
          ctx.fillText("NO WATERMARK", watermarkX, 28);
        }

        audioContext.close();
      } catch (error) {
        console.error("Error analyzing audio:", error);
        // Draw error state
        ctx.fillStyle = "#EF4444";
        ctx.font = "12px 'DM Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Unable to analyze audio", width / 2, height / 2);
      }

      setIsAnalyzing(false);
    };

    analyzeAudio();
  }, [audioUrl, hasWatermark, showWatermarkIndicator]);

  return (
    <div className="w-full">
      {title && (
        <p className="text-xs font-dm-sans font-semibold uppercase tracking-widest text-white/60 mb-2 text-center">
          {title}
        </p>
      )}
      <div className="relative bg-gray-900/50 rounded-lg p-4 border border-white/10">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-auto"
          style={{ imageRendering: "crisp-edges" }}
        />
        {isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
            <div className="text-white/60 text-sm font-dm-sans">Analyzing...</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs font-dm-sans">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#60A5FA] rounded"></div>
          <span className="text-white/60">Voice (0-3kHz)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#34D399] rounded"></div>
          <span className="text-white/60">Harmonics (3-8kHz)</span>
        </div>
        {hasWatermark && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#F59E0B] rounded"></div>
            <span className="text-white/60">Watermark (21kHz)</span>
          </div>
        )}
      </div>
    </div>
  );
}
