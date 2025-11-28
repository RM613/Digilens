import React, { useState, useEffect } from 'react';

const LoadingSpinner: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          // Slow down significantly at the end to wait for actual completion
           return Math.min(oldProgress + 0.5, 95); 
        }
        // Fast initially
        const increment = Math.random() * 15 + 5; 
        return Math.min(oldProgress + increment, 90);
      });
    }, 400);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const getMessage = (p: number) => {
    if (p < 20) return "Preparing image...";
    if (p < 40) return "Scanning pixels...";
    if (p < 60) return "Consulting Gemini AI...";
    if (p < 80) return "Recognizing shapes...";
    return "Finalizing results...";
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-sm mx-auto animate-fade-in-up">
      {/* Spinner Visual */}
      <div className="relative w-24 h-24 mb-8">
        {/* Background track */}
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        {/* Spinning indicator */}
        <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
        {/* Inner Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
           <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
      </div>

      {/* Progress Status */}
      <div className="w-full space-y-4">
        <div className="flex justify-between text-sm font-medium text-slate-700">
           <span>{getMessage(progress)}</span>
           <span>{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-brand-400 to-brand-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-center text-xs text-slate-400">
          Powered by Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;