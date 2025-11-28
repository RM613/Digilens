import React from 'react';
import { HistoryRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryRecord[];
  isLoading: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Analysis History</h2>
            <p className="text-slate-500 text-sm mt-1">Your previously identified digits</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium">No history yet</p>
              <p className="text-sm">Identify some numbers to see them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(record.timestamp).toLocaleDateString()} • {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase
                      ${record.confidence.toLowerCase() === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                    `}>
                      {record.confidence}
                    </span>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-24 h-24 flex-shrink-0 bg-slate-900 rounded-xl overflow-hidden">
                      <img 
                        src={record.imageData} 
                        alt="Scan" 
                        className="w-full h-full object-cover opacity-90"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-sm text-slate-500 font-medium">Digit:</span>
                        <span className="text-3xl font-black text-brand-600">{record.digit}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {record.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-white border-t border-slate-100 text-xs text-slate-400 text-center">
           Images stored locally in your browser (IndexedDB)
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;