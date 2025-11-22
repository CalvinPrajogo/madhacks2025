import { useState, useRef, useEffect } from "react";
import dragDropIcon from "../assets/dragdrop_2px.png";

export default function FileUpload({ onFileSelected, clearRef }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const buttonRef = useRef(null);

  // Expose clear function to parent
  useEffect(() => {
    if (clearRef) {
      clearRef.current = () => {
        setSelectedFile(null);
      };
    }
  }, [clearRef]);

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
    if (file && file.type.startsWith("audio/")) {
      setSelectedFile(file);
      if (onFileSelected) {
        onFileSelected(file);
      }
    } else {
      alert("Please upload an audio file (WAV, MP3, etc.)");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="relative" 
        style={{ 
          width: "280px", 
          height: "280px"
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label
          ref={buttonRef}
          htmlFor="audio-upload"
          className={`group absolute inset-0 m-auto flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
            isDragging ? 'opacity-100' : 'opacity-60 hover:opacity-100'
          }`}
          style={{ 
            width: "260px", 
            height: "260px"
          }}
          onMouseEnter={() => {
            if (!isDragging) {
              const img = buttonRef.current?.querySelector('img');
              if (img) img.style.transform = 'scale(1.03)';
            }
          }}
          onMouseLeave={() => {
            if (!isDragging) {
              const img = buttonRef.current?.querySelector('img');
              if (img) img.style.transform = 'scale(1)';
            }
          }}
        >
          {/* Inner dashed square */}
          <svg
            className="absolute inset-0"
            width="260"
            height="260"
            style={{ overflow: "visible" }}
          >
            <rect
              x="0"
              y="0"
              width="260"
              height="260"
              fill="none"
              stroke={isDragging ? "#0094c6" : "white"}
              strokeWidth="2"
              strokeDasharray="8 8"
              strokeLinecap="round"
              rx="8"
              ry="8"
              className="transition-colors duration-300"
            />
          </svg>

          {/* Drag/Drop Icon */}
          <img
            src={dragDropIcon}
            alt="Upload"
            className="transition-transform duration-300"
            style={{ 
              width: "200px", 
              height: "200px", 
              objectFit: "contain",
              transform: isDragging ? 'scale(1.03)' : 'scale(1)'
            }}
          />

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileInput}
            className="hidden"
            id="audio-upload"
          />
        </label>
      </div>

      <p className="text-lg font-bold uppercase tracking-widest font-dm-sans mt-2">
        Upload Audio File
      </p>
    </div>
  );
}
