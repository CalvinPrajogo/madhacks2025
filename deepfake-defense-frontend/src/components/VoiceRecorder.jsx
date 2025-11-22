import { useState, useRef } from "react";
import microphoneIcon from "../assets/microphone_2px.png";

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerInterval = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Pass blob to parent
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
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
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`relative flex items-center justify-center transition-all ${
          isRecording ? "animate-pulse" : ""
        }`}
        style={{ width: "300px", height: "300px" }}
      >
        {/* Outer circle */}
        <div
          className={`absolute inset-0 rounded-full border-2 transition-colors ${
            isRecording ? "border-red-500" : "border-white"
          }`}
        />

        {/* Microphone Icon */}
        <img
          src={microphoneIcon}
          alt="Microphone"
          className={`transition-opacity ${
            isRecording ? "opacity-80" : "opacity-100"
          }`}
        />
      </button>

      <p className="text-2xl uppercase tracking-widest font-dm-sans">
        {isRecording ? "Recording..." : "Record Your Voice"}
      </p>

      {isRecording && (
        <div className="text-xl font-mono text-gray-300">
          {formatTime(recordingTime)}
        </div>
      )}

      {audioURL && (
        <div className="w-full max-w-md">
          <audio src={audioURL} controls className="w-full" />
        </div>
      )}
    </div>
  );
}
