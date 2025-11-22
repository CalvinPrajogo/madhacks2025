import { useState } from "react";
import DeepfakeDetector from "./components/DeepfakeDetector";
import DemoFlow from "./components/DemoFlow";
import "./index.css";

function App() {
  const [mode, setMode] = useState("demo"); // "detector" or "demo"

  return (
    <div className="min-h-screen">
      {/* Floating bubbles */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bubble" />
      ))}

      {/* Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex gap-2 bg-gray-800/80 backdrop-blur-sm p-2 rounded-lg border border-gray-700">
          <button
            onClick={() => setMode("demo")}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              mode === "demo"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Demo Flow
          </button>
          <button
            onClick={() => setMode("detector")}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              mode === "detector"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Quick Detector
          </button>
        </div>
      </div>

      {mode === "demo" ? <DemoFlow /> : <DeepfakeDetector />}
    </div>
  );
}

export default App;
