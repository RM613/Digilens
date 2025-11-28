import React from 'react';
import { AnalysisResult as AnalysisResultType } from '../types';

interface AnalysisResultProps {
  result: AnalysisResultType;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset }) => {
  const isHighConfidence = result.confidence.toLowerCase() === 'high';
  
  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
      <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
        <h3 className="font-semibold text-slate-700">Analysis Result</h3>
        <span className={`
          px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase
          ${isHighConfidence ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
        `}>
          {result.confidence} Confidence
        </span>
      </div>

      <div className="p-8 flex flex-col items-center">
        <div className="relative mb-6 group cursor-default">
           <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-purple-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
           <div className="relative w-40 h-40 bg-white rounded-full flex items-center justify-center border-4 border-slate-50 shadow-inner">
             <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-600 to-purple-600 select-none">
               {result.digit}
             </span>
           </div>
        </div>

        <p className="text-slate-600 text-center max-w-md leading-relaxed">
          {result.explanation}
        </p>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-slate-500 hover:text-brand-600 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Identify Another</span>
        </button>
      </div>
    </div>
  );
};

export default AnalysisResult;