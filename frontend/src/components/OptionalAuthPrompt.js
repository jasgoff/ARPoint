import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OptionalAuthPrompt = () => {
  const { isAuthenticated, login } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    // Check if user previously dismissed the prompt
    return localStorage.getItem('auth_prompt_dismissed') === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('auth_prompt_dismissed', 'true');
  };

  const handleLogin = () => {
    login();
  };

  // Don't show if user is authenticated or has dismissed
  if (isAuthenticated || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4 slide-down">
      <div className="glass-panel rounded-xl p-4 border border-white/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF4500] to-[#FF6B35] flex items-center justify-center">
              <LogIn className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold">Sign in to sync</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-white/70 text-sm mb-4">
          Sign in with Google to save your data across devices and export to Google Drive.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleLogin}
            className="flex-1 h-10 text-sm font-semibold bg-white text-[#0A0A0A] hover:bg-white/90 rounded-lg transition-all"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="h-10 text-sm font-semibold text-white/70 hover:text-white border-white/20 hover:bg-white/10 rounded-lg transition-all"
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OptionalAuthPrompt;
