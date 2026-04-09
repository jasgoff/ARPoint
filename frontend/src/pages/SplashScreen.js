import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show splash for 5 seconds, then navigate to AR view
    const timer = setTimeout(() => {
      navigate('/dashboard/ar', { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0A0A0A] via-[#1A0A0A] to-[#0A0A0A] px-6">
      <div className="text-center fade-in">
        {/* Animated Logo */}
        <div className="mb-8 animate-pulse">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-[#FF4500] to-[#FF6B35] flex items-center justify-center neon-glow-orange shadow-2xl">
            <Compass className="w-16 h-16 text-white animate-spin-slow" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-4 hud-text">
          AR Survey
        </h1>
        <p className="text-white/60 text-lg sm:text-xl mb-12">
          Professional surveying tools with AR precision
        </p>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF4500] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#FF4500] animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#FF4500] animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        <p className="mt-8 text-white/40 text-sm">
          Loading AR viewport...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
