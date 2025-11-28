import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthView = 'login' | 'signup' | 'forgot_email' | 'forgot_reset' | 'forgot_success';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose, onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  // Forgot Password specific state
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setView(initialMode);
        setFormData({ name: '', email: '', password: '' });
        setResetOtp('');
        setNewPassword('');
        setError(null);
        setSuccessMsg(null);
        setShowPassword(false);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    const user = await authService.login(formData.email, formData.password);
    onLoginSuccess(user);
    onClose();
  };

  const handleSignup = async () => {
    const user = await authService.signup(formData.name, formData.email, formData.password);
    onLoginSuccess(user);
    onClose();
  };

  const handleForgotRequest = async () => {
    await authService.requestPasswordReset(formData.email);
    setView('forgot_reset');
    // We display a generic message. The user (dev) must check console for the OTP.
    setSuccessMsg(`Verification code sent to ${formData.email}`);
  };

  const handleForgotReset = async () => {
    await authService.resetPassword(formData.email, resetOtp, newPassword);
    setView('forgot_success');
    setResetOtp('');
    setNewPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      switch (view) {
        case 'login':
          await handleLogin();
          break;
        case 'signup':
          await handleSignup();
          break;
        case 'forgot_email':
          await handleForgotRequest();
          break;
        case 'forgot_reset':
          await handleForgotReset();
          break;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
        case 'login': return 'Welcome Back';
        case 'signup': return 'Create Account';
        case 'forgot_email': return 'Reset Password';
        case 'forgot_reset': return 'Verify OTP';
        case 'forgot_success': return 'Success!';
    }
  };

  const getDescription = () => {
    switch (view) {
        case 'login': return 'Enter your credentials to access your account';
        case 'signup': return 'Join DigitLens to save your history';
        case 'forgot_email': return 'Enter your email to receive a reset code';
        case 'forgot_reset': return 'Enter the code sent to your email';
        case 'forgot_success': return 'Your password has been reset successfully';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center flex-shrink-0">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-500/30 mx-auto mb-4">
            D
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {getTitle()}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {getDescription()}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {view === 'forgot_success' ? (
            <div className="flex flex-col items-center justify-center py-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-center text-slate-600 mb-8">
                  Your password has been updated. You can now access your account with your new credentials.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        setView('login');
                        setFormData(prev => ({ ...prev, password: '' }));
                    }}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98]"
                >
                    Back to Log in
                </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {successMsg && (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMsg}</span>
                    </div>
                )}

                {view === 'signup' && (
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    </div>
                )}

                {/* Email Field */}
                {(view === 'login' || view === 'signup' || view === 'forgot_email') && (
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    </div>
                )}

                {/* Password Field (Login/Signup) */}
                {(view === 'login' || view === 'signup') && (
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                        </button>
                    </div>
                    {view === 'login' && (
                        <div className="flex justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setView('forgot_email');
                                    setError(null);
                                    setSuccessMsg(null);
                                }}
                                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                    </div>
                )}

                {/* OTP Flow Fields */}
                {view === 'forgot_reset' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                                value={formData.email}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">OTP Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 tracking-widest font-mono placeholder-slate-400"
                                placeholder="123456"
                                value={resetOtp}
                                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <button
                type="submit"
                disabled={isLoading}
                className={`
                    w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-brand-500/30
                    transition-all transform active:scale-[0.98] mt-4
                    ${isLoading ? 'bg-brand-400 cursor-wait' : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-500/40'}
                `}
                >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                    </span>
                ) : (
                    view === 'login' ? 'Sign In' : 
                    view === 'signup' ? 'Create Account' :
                    view === 'forgot_email' ? 'Send OTP' : 'Reset Password'
                )}
                </button>
                
                {(view === 'forgot_email' || view === 'forgot_reset') && (
                    <button
                        type="button"
                        onClick={() => setView('login')}
                        className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 mt-2"
                    >
                        Back to Log in
                    </button>
                )}

            </form>
          )}
        </div>

        {/* Footer */}
        {(view === 'login' || view === 'signup') && (
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center flex-shrink-0">
            <p className="text-sm text-slate-600">
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                onClick={() => {
                    setView(view === 'login' ? 'signup' : 'login');
                    setError(null);
                    setSuccessMsg(null);
                }}
                className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
                >
                {view === 'login' ? 'Sign up' : 'Log in'}
                </button>
            </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;