import React, { useCallback, useRef, useState } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, disabled]);

  const handleBrowseClick = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
      className={`
        relative w-full aspect-[4/3] sm:aspect-[2/1] rounded-3xl border-4 border-dashed 
        flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        group overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : ''}
        ${
          isDragging
            ? 'border-brand-500 bg-brand-50 scale-[1.02] shadow-xl'
            : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="z-10 flex flex-col items-center space-y-4 p-6 text-center">
        <div className={`
          p-4 rounded-full transition-colors duration-300
          ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500'}
        `}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div>
          <p className="text-lg font-semibold text-slate-700">
            {isDragging ? 'Drop it like it\'s hot!' : 'Click or drag image here'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Supports JPEG, PNG, WEBP
          </p>
        </div>
      </div>
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-brand-200 rounded-full mix-blend-multiply filter blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 animate-blob animation-delay-2000"></div>
    </div>
  );
};

export default DropZone;