import { useState, useRef, useEffect } from "react";
import microphoneIcon from "../assets/microphone_2px.png";

export default function VoiceRecorder({
  onRecordingComplete,
  clearRef,
  audioURL,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [internalAudioURL, setInternalAudioURL] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);

  // Expose clear function to parent
  useEffect(() => {
    if (clearRef) {
      clearRef.current = () => {
        setInternalAudioURL("");
        setRecordingTime(0);
        // Don't reset hasRecorded so caption stays as RE-RECORD
      };
    }
  }, [clearRef]);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerInterval = useRef(null);
  const buttonRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Start drawing waveform when recording begins and canvas is ready
  useEffect(() => {
    if (isRecording && canvasRef.current && analyserRef.current) {
      console.log("Starting waveform animation");
      drawWaveform();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas completely
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "#0094c6";
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      setIsRecording(true);

      // Set up audio visualization
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;

      // Use the browser's supported MIME type with proper detection
      const options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        console.warn('audio/webm not supported, using default');
        mediaRecorder.current = new MediaRecorder(stream);
      } else {
        mediaRecorder.current = new MediaRecorder(stream, options);
      }

      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        // Use the actual MIME type from the MediaRecorder
        const mimeType = mediaRecorder.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setInternalAudioURL(url);
        setHasRecorded(true);

        // Pass blob to parent as a File object with proper extension
        if (onRecordingComplete) {
          const extension = mimeType.includes('webm') ? 'webm' : 'wav';
          const file = new File([audioBlob], `recording.${extension}`, { type: mimeType });
          onRecordingComplete(file, url);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Clean up audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };

      mediaRecorder.current.start();
      setRecordingTime(0);

      // Start timer
      timerInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      clearInterval(timerInterval.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: "280px", height: "280px" }}>
        {/* Outer rotating dotted circle */}
        <div
          className="absolute inset-0 rounded-full border-dotted border-white/40"
          style={{
            borderWidth: "4px",
            animation: "spin-slow 40s linear infinite",
          }}
        />

        <button
          ref={buttonRef}
          onClick={isRecording ? stopRecording : startRecording}
          className="group absolute inset-0 m-auto flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-300"
          style={{
            width: "260px",
            height: "260px",
          }}
          onMouseEnter={() => {
            const img = buttonRef.current?.querySelector("img");
            if (img) img.style.transform = "scale(1.03)";
          }}
          onMouseLeave={() => {
            const img = buttonRef.current?.querySelector("img");
            if (img) img.style.transform = "scale(1)";
          }}
        >
          {/* Inner solid circle */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-colors ${
              isRecording ? "border-[#0094c6]" : "border-white"
            }`}
          />

          {/* Microphone Icon or Waveform */}
          <img
            src={microphoneIcon}
            alt="Microphone"
            className="transition-all duration-500 absolute"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "contain",
              opacity: isRecording ? 0 : 1,
              transform: isRecording ? "scale(0.95)" : "scale(1)",
            }}
          />
          <canvas
            ref={canvasRef}
            width="240"
            height="120"
            className="z-10 transition-opacity duration-500"
            style={{
              imageRendering: "crisp-edges",
              opacity: isRecording ? 1 : 0,
            }}
          />
        </button>
      </div>

      <p className="text-lg font-bold uppercase tracking-widest font-dm-sans mt-2">
        {isRecording
          ? "Recording..."
          : hasRecorded
          ? "Re-Record Audio"
          : "Record Audio"}
      </p>

      {isRecording && (
        <div className="text-xl font-mono text-gray-300">
          {formatTime(recordingTime)}
        </div>
      )}
    </div>
  );
}
