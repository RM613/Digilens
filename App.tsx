import React, { useState, useEffect } from 'react';
import { identifyHandwrittenNumber } from './services/geminiService';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import DropZone from './components/DropZone';
import AnalysisResult from './components/AnalysisResult';
import LoadingSpinner from './components/LoadingSpinner';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import { AppState, AnalysisResult as AnalysisResultType, User, HistoryRecord } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Clean up object URL on unmount or change
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleAuthAction = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setHistory([]);
  };

  const loadHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    setIsHistoryOpen(true);
    try {
      const records = await storageService.getUserHistory(user.email);
      setHistory(records);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Reset state
    setError(null);
    setResult(null);
    setSelectedImage(file);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    // Start analysis
    setAppState(AppState.ANALYZING);

    try {
      // Simulate a small delay for better UX if API is too fast, 
      // ensuring loading spinner is seen
      const [analysisResult] = await Promise.all([
        identifyHandwrittenNumber(file),
        new Promise(resolve => setTimeout(resolve, 800)) 
      ]);

      setResult(analysisResult);
      setAppState(AppState.SUCCESS);

      // Auto-save if user is logged in
      if (user) {
        try {
          await storageService.saveScan(user.email, file, analysisResult);
          console.log("Scan saved to history");
        } catch (storageErr) {
          console.error("Failed to save scan", storageErr);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze the image. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-100 selection:text-brand-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/30">
              D
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Digit<span className="text-brand-600">Lens</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button 
                  onClick={loadHistory}
                  className="hidden sm:flex items-center space-x-1 text-slate-500 hover:text-brand-600 font-medium text-sm transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>History</span>
                </button>
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <span className="hidden sm:block text-sm font-medium text-slate-600">
                  Hi, {user.name}
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 border border-slate-200 rounded-full hover:bg-red-50 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => handleAuthAction('login')}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                >
                  Log in
                </button>
                <button 
                  onClick={() => handleAuthAction('signup')}
                  className="px-5 py-2 text-sm font-medium bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 transform hover:-translate-y-0.5"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Handwritten Number <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
              Recognition AI
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload an image of a handwritten digit, and our Gemini-powered AI will instantly identify it for you.
          </p>
          {!user && (
             <p className="text-sm text-brand-600 font-medium bg-brand-50 inline-block px-4 py-1 rounded-full">
               ✨ Tip: Log in to save your scan history!
             </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Upload / Preview */}
          <div className="space-y-6">
            <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100">
              {appState === AppState.IDLE ? (
                <DropZone onFileSelect={handleFileSelect} />
              ) : (
                <div className="relative aspect-[4/3] sm:aspect-[2/1] bg-slate-900 rounded-3xl overflow-hidden group">
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Uploaded digit" 
                      className="w-full h-full object-contain opacity-90 transition-opacity duration-300" 
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button 
                      onClick={handleReset}
                      className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Instruction / Hint */}
            {appState === AppState.IDLE && (
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>For best results, upload a clear image containing a single digit (0-9) on a plain background.</p>
              </div>
            )}
          </div>

          {/* Right Column: Results / Status */}
          <div className="flex flex-col justify-center min-h-[300px]">
            {appState === AppState.IDLE && (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p>Result will appear here</p>
              </div>
            )}

            {appState === AppState.ANALYZING && <LoadingSpinner />}

            {appState === AppState.SUCCESS && result && (
              <AnalysisResult result={result} onReset={handleReset} />
            )}

            {appState === AppState.ERROR && (
              <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 mt-auto bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} DigitLens. Powered by Google Gemini.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setUser(user)}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        isLoading={isLoadingHistory}
      />
    </div>
  );
};

export default App;