import { useState, useEffect } from "react";
import DeepfakeDetector from "./components/DeepfakeDetector";
import DemoFlow from "./components/DemoFlow";
import phishnetLogo from "./assets/phishnet_logo.png";
import "./index.css";

function App() {
  const [mode, setMode] = useState("demo"); // "detector" or "demo"
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState("demo");
  const [slideDirection, setSlideDirection] = useState(null);

  useEffect(() => {
    if (mode !== displayMode && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection(mode === "detector" ? "left" : "right");
      
      // Wait for slide-out animation
      setTimeout(() => {
        setDisplayMode(mode);
      }, 300);
    } else if (mode === displayMode && isTransitioning) {
      // Slide-in animation is happening
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 300);
    }
  }, [mode, displayMode, isTransitioning]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Floating bubbles */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bubble" />
      ))}

      {/* Logo and Title - top left */}
      <div className="fixed top-6 left-6 z-50">
        <h1 className="text-3xl flex items-center gap-3">
          <img src={phishnetLogo} alt="PhishNet" className="h-[35px]" />
          <span>
            <span className="font-bold">Phish</span>
            <span className="font-light">Net</span>
          </span>
        </h1>
      </div>

      {/* Mode Toggle - top right */}
      <div className="fixed top-6 right-6 z-50">
        <div className="flex gap-3">
          <button
            onClick={() => setMode("demo")}
            className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              mode === "demo"
                ? "bg-white text-gray-800"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Demo
          </button>
          <button
            onClick={() => setMode("detector")}
            className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              mode === "detector"
                ? "bg-white text-gray-800"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Quick Detector
          </button>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      <div
        className={`${
          isTransitioning && mode !== displayMode
            ? slideDirection === "left"
              ? "animate-slide-out-left"
              : "animate-slide-out-right"
            : isTransitioning && mode === displayMode
            ? slideDirection === "left"
              ? "animate-slide-in-right"
              : "animate-slide-in-left"
            : ""
        }`}
      >
        {displayMode === "demo" ? <DemoFlow /> : <DeepfakeDetector />}
      </div>
    </div>
  );
}

export default App;
