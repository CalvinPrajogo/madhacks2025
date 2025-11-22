import { useState } from "react";
import DeepfakeDetector from "./components/DeepfakeDetector";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen">
      {/* Floating bubbles */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bubble" />
      ))}
      <DeepfakeDetector />
    </div>
  );
}

export default App;
