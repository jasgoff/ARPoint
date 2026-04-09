import React from 'react';

const Compass3D = ({ heading = 0, orientation = { alpha: 0, beta: 0, gamma: 0 }, calibrationOffset = -90 }) => {
  // Apply calibration offset and normalize heading to 0-360
  // Default -90 offset rotates compass counter-clockwise 90° for landscape mode
  const calibratedHeading = heading + calibrationOffset;
  const normalizedHeading = ((calibratedHeading % 360) + 360) % 360;
  
  // Get orientation values with defaults
  const beta = orientation.beta || 0;   // Front-back tilt (-180 to 180)
  const gamma = orientation.gamma || 0; // Left-right tilt (-90 to 90)
  
  // Clamp for visual limits
  const clampedBeta = Math.max(-60, Math.min(60, beta));
  const clampedGamma = Math.max(-60, Math.min(60, gamma));
  
  // Calculate bubble position (inverted - bubble goes opposite to tilt)
  const bubbleX = (clampedGamma / 60) * 28;
  const bubbleY = (clampedBeta / 60) * 28;
  
  // Check if level (within 3 degrees)
  const isLevel = Math.abs(beta) < 3 && Math.abs(gamma) < 3;

  // Get direction label
  const getDirectionLabel = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  // 3D marble transform - tilts with device but does NOT rotate with heading
  const marbleTransform = `
    perspective(600px)
    rotateX(${clampedBeta * 0.5}deg)
    rotateY(${-clampedGamma * 0.5}deg)
  `;

  // Compass rose rotates opposite to heading so needle appears to point north
  const roseRotation = -normalizedHeading;

  return (
    <div
      data-testid="compass-3d"
      className="relative"
      style={{ width: '160px', height: '160px' }}
    >
      {/* Glass marble outer sphere */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, 
              rgba(255,255,255,0.4) 0%, 
              rgba(255,255,255,0.1) 20%,
              rgba(120,200,255,0.05) 40%,
              rgba(0,50,100,0.1) 60%,
              rgba(0,20,40,0.3) 100%
            )
          `,
          boxShadow: `
            0 20px 60px rgba(0,0,0,0.5),
            0 0 80px rgba(0,150,255,0.1),
            inset 0 -20px 40px rgba(0,0,0,0.4),
            inset 0 20px 40px rgba(255,255,255,0.15),
            inset 0 0 60px rgba(0,100,200,0.1)
          `,
          border: '1px solid rgba(255,255,255,0.2)',
          transform: marbleTransform,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Inner liquid/glass layer */}
        <div
          className="absolute rounded-full"
          style={{
            top: '8px',
            left: '8px',
            right: '8px',
            bottom: '8px',
            background: `
              radial-gradient(circle at 30% 30%,
                rgba(200,230,255,0.15) 0%,
                rgba(100,180,255,0.08) 30%,
                rgba(0,50,100,0.2) 70%,
                rgba(0,20,50,0.4) 100%
              )
            `,
            boxShadow: `
              inset 0 10px 30px rgba(255,255,255,0.1),
              inset 0 -10px 30px rgba(0,0,0,0.3)
            `,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Floating compass disc inside marble */}
          <div
            className="absolute rounded-full overflow-hidden"
            style={{
              top: '12px',
              left: '12px',
              right: '12px',
              bottom: '12px',
              background: `
                linear-gradient(145deg, 
                  rgba(20,20,25,0.95) 0%,
                  rgba(10,10,15,0.98) 100%
                )
              `,
              boxShadow: `
                0 4px 20px rgba(0,0,0,0.5),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              border: '2px solid rgba(255,255,255,0.15)'
            }}
          >
            {/* Compass rose SVG - rotates with heading */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              style={{
                transform: `rotate(${roseRotation}deg)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* Outer degree ring */}
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              
              {/* Degree tick marks */}
              {Array.from({ length: 72 }).map((_, i) => {
                const angle = i * 5;
                const isCardinal = angle % 90 === 0;
                const isIntercardinal = angle % 45 === 0 && !isCardinal;
                const isMajor = angle % 30 === 0;
                const radAngle = (angle - 90) * Math.PI / 180;
                const outerR = 45;
                const innerR = isCardinal ? 35 : isIntercardinal ? 38 : isMajor ? 40 : 42;
                
                return (
                  <line
                    key={i}
                    x1={50 + outerR * Math.cos(radAngle)}
                    y1={50 + outerR * Math.sin(radAngle)}
                    x2={50 + innerR * Math.cos(radAngle)}
                    y2={50 + innerR * Math.sin(radAngle)}
                    stroke={angle === 0 ? '#FF4500' : isCardinal ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isCardinal ? 2 : isIntercardinal ? 1.5 : 0.5}
                    strokeLinecap="round"
                  />
                );
              })}
              
              {/* Cardinal direction labels - rotate with rose */}
              {[
                { label: 'N', angle: 0, color: '#FF4500' },
                { label: 'E', angle: 90, color: '#FFFFFF' },
                { label: 'S', angle: 180, color: '#FFFFFF' },
                { label: 'W', angle: 270, color: '#FFFFFF' }
              ].map(({ label, angle, color }) => {
                const radAngle = (angle - 90) * Math.PI / 180;
                const r = 28;
                return (
                  <text
                    key={label}
                    x={50 + r * Math.cos(radAngle)}
                    y={50 + r * Math.sin(radAngle)}
                    fill={color}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Chivo, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      textShadow: label === 'N' ? '0 0 8px rgba(255,69,0,0.8)' : 'none'
                    }}
                  >
                    {label}
                  </text>
                );
              })}
              
              {/* Compass needle - North (red) - points to N on the rose */}
              <path
                d="M50 14 L46 48 L50 44 L54 48 Z"
                fill="url(#northGradient)"
                filter="drop-shadow(0 0 4px rgba(255,69,0,0.9))"
              />
              
              {/* Compass needle - South (silver) */}
              <path
                d="M50 86 L46 52 L50 56 L54 52 Z"
                fill="url(#southGradient)"
              />
              
              {/* Center pivot jewel */}
              <circle cx="50" cy="50" r="6" fill="url(#pivotGradient)" />
              <circle cx="50" cy="50" r="3" fill="#FF4500" filter="drop-shadow(0 0 4px rgba(255,69,0,0.6))" />
              
              {/* Gradients */}
              <defs>
                <linearGradient id="northGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B35" />
                  <stop offset="50%" stopColor="#FF4500" />
                  <stop offset="100%" stopColor="#CC3700" />
                </linearGradient>
                <linearGradient id="southGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#666666" />
                  <stop offset="50%" stopColor="#AAAAAA" />
                  <stop offset="100%" stopColor="#888888" />
                </linearGradient>
                <radialGradient id="pivotGradient">
                  <stop offset="0%" stopColor="#444444" />
                  <stop offset="70%" stopColor="#222222" />
                  <stop offset="100%" stopColor="#111111" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Bubble level floating in liquid */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '14px',
              height: '14px',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${bubbleX}px), calc(-50% + ${bubbleY}px))`,
              background: isLevel
                ? 'radial-gradient(circle at 30% 30%, rgba(0,255,100,0.9) 0%, rgba(0,200,80,0.7) 50%, rgba(0,150,60,0.5) 100%)'
                : 'radial-gradient(circle at 30% 30%, rgba(255,200,0,0.9) 0%, rgba(255,150,0,0.7) 50%, rgba(200,100,0,0.5) 100%)',
              boxShadow: isLevel
                ? '0 0 12px rgba(0,255,100,0.5), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)'
                : '0 0 10px rgba(255,180,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)',
              transition: 'transform 0.15s ease-out, background 0.3s ease',
              zIndex: 10
            }}
          >
            {/* Bubble highlight */}
            <div
              className="absolute rounded-full"
              style={{
                width: '5px',
                height: '3px',
                top: '2px',
                left: '3px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '50%',
                filter: 'blur(1px)'
              }}
            />
          </div>
        </div>

        {/* Glass reflection highlights */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '5%',
            left: '8%',
            width: '45%',
            height: '30%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
            borderRadius: '50% 50% 50% 50%',
            transform: 'rotate(-15deg)',
            filter: 'blur(2px)'
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            bottom: '10%',
            right: '10%',
            width: '20%',
            height: '15%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(3px)'
          }}
        />
      </div>

      {/* Fixed north indicator arrow (top of container) - N always aligns here */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{ top: '-14px' }}
      >
        <svg width="24" height="16" viewBox="0 0 24 16">
          <polygon
            points="12,16 2,0 22,0"
            fill="#FF4500"
            filter="drop-shadow(0 0 8px rgba(255,69,0,0.9))"
          />
        </svg>
      </div>

      {/* Heading readout */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ bottom: '-40px' }}
      >
        <div 
          className="font-mono text-2xl font-bold tracking-wider"
          style={{ 
            color: '#00FF41', 
            textShadow: '0 0 15px rgba(0,255,65,0.6), 0 2px 4px rgba(0,0,0,0.8)' 
          }}
        >
          {Math.round(normalizedHeading)}°
        </div>
        <div className="text-sm font-bold text-white/80 tracking-widest mt-1">
          {getDirectionLabel(normalizedHeading)}
        </div>
      </div>

      {/* Level status */}
      <div 
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '-75px' }}
      >
        <div 
          className="text-[10px] font-mono font-bold tracking-wider"
          style={{ 
            color: isLevel ? '#00FF41' : '#FFD700',
            textShadow: isLevel ? '0 0 8px rgba(0,255,65,0.5)' : '0 0 8px rgba(255,215,0,0.5)'
          }}
        >
          {isLevel ? '● LEVEL' : `◐ TILT ${Math.abs(clampedBeta).toFixed(0)}° / ${Math.abs(clampedGamma).toFixed(0)}°`}
        </div>
      </div>
    </div>
  );
};

export default Compass3D;
