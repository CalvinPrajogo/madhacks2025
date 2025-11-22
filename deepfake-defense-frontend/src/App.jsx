import { useState } from 'react';
import DeepfakeDetector from './components/DeepfakeDetector';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <DeepfakeDetector />
    </div>
  );
}

export default App;
