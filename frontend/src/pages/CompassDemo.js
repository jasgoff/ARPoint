import React, { useState, useEffect } from 'react';
import Compass3D from '@/components/ar/Compass3D';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CompassDemo = () => {
  const [heading, setHeading] = useState(0);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotate heading for demo
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setHeading(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Simulate device orientation
  const handleMouseMove = (e) => {
    if (autoRotate) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setOrientation({
      alpha: heading,
      beta: (y - 0.5) * 60,  // -30 to 30 degrees
      gamma: (x - 0.5) * 60  // -30 to 30 degrees
    });
  };

  return (
    <div 
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8"
      onMouseMove={handleMouseMove}
      data-testid="compass-demo"
    >
      <h1 className="font-heading text-3xl font-black text-white mb-2 tracking-tight">
        3D BALL COMPASS
      </h1>
      <p className="text-white/50 text-sm mb-12">with Bubble Level</p>

      {/* Compass */}
      <div className="mb-20">
        <Compass3D heading={heading} orientation={orientation} />
      </div>

      {/* Controls */}
      <div className="glass-panel rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/70 text-sm font-medium">Auto Rotate</span>
          <Button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${
              autoRotate 
                ? 'bg-[#00FF41] text-black' 
                : 'bg-white/10 text-white/60'
            }`}
          >
            {autoRotate ? 'ON' : 'OFF'}
          </Button>
        </div>

        {!autoRotate && (
          <>
            <div className="mb-4">
              <label className="text-white/50 text-xs uppercase tracking-wider">
                Heading: {heading}°
              </label>
              <input
                type="range"
                min="0"
                max="359"
                value={heading}
                onChange={(e) => setHeading(Number(e.target.value))}
                className="w-full mt-2 accent-[#FF4500]"
              />
            </div>

            <div className="mb-4">
              <label className="text-white/50 text-xs uppercase tracking-wider">
                Tilt X (Beta): {orientation.beta.toFixed(1)}°
              </label>
              <input
                type="range"
                min="-45"
                max="45"
                value={orientation.beta}
                onChange={(e) => setOrientation(prev => ({ ...prev, beta: Number(e.target.value) }))}
                className="w-full mt-2 accent-[#007AFF]"
              />
            </div>

            <div className="mb-4">
              <label className="text-white/50 text-xs uppercase tracking-wider">
                Tilt Y (Gamma): {orientation.gamma.toFixed(1)}°
              </label>
              <input
                type="range"
                min="-45"
                max="45"
                value={orientation.gamma}
                onChange={(e) => setOrientation(prev => ({ ...prev, gamma: Number(e.target.value) }))}
                className="w-full mt-2 accent-[#007AFF]"
              />
            </div>

            <Button
              onClick={() => setOrientation({ alpha: 0, beta: 0, gamma: 0 })}
              className="w-full h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Level
            </Button>
          </>
        )}

        <p className="text-white/30 text-xs text-center mt-4">
          {autoRotate 
            ? 'Disable auto-rotate to manually control' 
            : 'Move mouse over compass or use sliders'}
        </p>
      </div>

      {/* Info */}
      <div className="mt-8 text-center text-white/40 text-xs max-w-sm">
        <p className="mb-2">
          <span className="text-[#00FF41]">●</span> Green bubble = Level
        </p>
        <p>
          <span className="text-[#FFD700]">●</span> Yellow bubble = Tilted
        </p>
      </div>
    </div>
  );
};

export default CompassDemo;
