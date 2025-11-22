import { useState } from 'react';

export default function FileUpload({ onFileSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      if (onFileSelected) {
        onFileSelected(file);
      }
    } else {
      alert('Please upload an audio file (WAV, MP3, etc.)');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">📁 Upload Audio File</h3>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          className="hidden"
          id="audio-upload"
        />
        
        <label htmlFor="audio-upload" className="cursor-pointer">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-lg">
            Drag and drop audio file here
            <br />or click to browse
          </p>
          {selectedFile && (
            <p className="mt-4 text-blue-400">
              Selected: {selectedFile.name}
            </p>
          )}
        </label>
      </div>
    </div>
  );
}
