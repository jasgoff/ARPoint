import React, { useMemo } from 'react';

const Compass3D = ({ heading = 0, orientation = { alpha: 0, beta: 0, gamma: 0 } }) => {
  // Normalize heading to 0-360
  const normalizedHeading = ((heading % 360) + 360) % 360;
  
  // Get orientation values with defaults
  const beta = orientation.beta || 0;   // Front-back tilt (-180 to 180)
  const gamma = orientation.gamma || 0; // Left-right tilt (-90 to 90)
  
  // Clamp for visual limits
  const clampedBeta = Math.max(-60, Math.min(60, beta));
  const clampedGamma = Math.max(-60, Math.min(60, gamma));
  
  // Calculate bubble position (inverted - bubble goes opposite to tilt)
  const bubbleX = (clampedGamma / 60) * 30;
  const bubbleY = (clampedBeta / 60) * 30;
  
  // Check if level (within 3 degrees)
  const isLevel = Math.abs(beta) < 3 && Math.abs(gamma) < 3;

  // Get direction label
  const getDirectionLabel = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  // Determine which device edge/corner the compass is pointing to
  const getDeviceEdgePointer = (heading, beta, gamma) => {
    // Combine heading with tilt to determine 3D direction
    const effectiveHeading = heading;
    
    // Determine primary direction based on heading
    let hDir = '';
    if (effectiveHeading >= 337.5 || effectiveHeading < 22.5) hDir = 'TOP';
    else if (effectiveHeading >= 22.5 && effectiveHeading < 67.5) hDir = 'TOP-RIGHT';
    else if (effectiveHeading >= 67.5 && effectiveHeading < 112.5) hDir = 'RIGHT';
    else if (effectiveHeading >= 112.5 && effectiveHeading < 157.5) hDir = 'BOTTOM-RIGHT';
    else if (effectiveHeading >= 157.5 && effectiveHeading < 202.5) hDir = 'BOTTOM';
    else if (effectiveHeading >= 202.5 && effectiveHeading < 247.5) hDir = 'BOTTOM-LEFT';
    else if (effectiveHeading >= 247.5 && effectiveHeading < 292.5) hDir = 'LEFT';
    else if (effectiveHeading >= 292.5 && effectiveHeading < 337.5) hDir = 'TOP-LEFT';
    
    // Add vertical component based on tilt
    let vDir = '';
    if (beta > 20) vDir = ' ↗ FRONT';
    else if (beta < -20) vDir = ' ↙ BACK';
    
    return { edge: hDir, tilt: vDir };
  };

  const devicePointer = getDeviceEdgePointer(normalizedHeading, clampedBeta, clampedGamma);

  // 3D marble transform - full multi-axis movement
  const marbleTransform = `
    perspective(600px)
    rotateX(${clampedBeta * 0.6}deg)
    rotateY(${-clampedGamma * 0.6}deg)
    rotateZ(${-normalizedHeading}deg)
  `;

  // Inner compass disc transform (counter-rotates to stay readable)
  const innerTransform = `
    rotateZ(${normalizedHeading}deg)
  `;

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
            className="absolute rounded-full"
            style={{
              top: '15px',
              left: '15px',
              right: '15px',
              bottom: '15px',
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
              border: '2px solid rgba(255,255,255,0.15)',
              transform: innerTransform,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Compass rose SVG */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
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
              
              {/* Cardinal direction labels */}
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
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="Chivo, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {label}
                  </text>
                );
              })}
              
              {/* Compass needle - North (red) */}
              <path
                d="M50 12 L46 50 L50 45 L54 50 Z"
                fill="url(#northGradient)"
                filter="drop-shadow(0 0 3px rgba(255,69,0,0.8))"
              />
              
              {/* Compass needle - South (silver) */}
              <path
                d="M50 88 L46 50 L50 55 L54 50 Z"
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
              width: '16px',
              height: '16px',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${bubbleX}px), calc(-50% + ${bubbleY}px))`,
              background: isLevel
                ? 'radial-gradient(circle at 30% 30%, rgba(0,255,100,0.9) 0%, rgba(0,200,80,0.7) 50%, rgba(0,150,60,0.5) 100%)'
                : 'radial-gradient(circle at 30% 30%, rgba(255,200,0,0.9) 0%, rgba(255,150,0,0.7) 50%, rgba(200,100,0,0.5) 100%)',
              boxShadow: isLevel
                ? '0 0 15px rgba(0,255,100,0.5), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.4)'
                : '0 0 12px rgba(255,180,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.4)',
              transition: 'transform 0.15s ease-out, background 0.3s ease',
              zIndex: 10
            }}
          >
            {/* Bubble highlight */}
            <div
              className="absolute rounded-full"
              style={{
                width: '6px',
                height: '4px',
                top: '3px',
                left: '4px',
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

      {/* Fixed north indicator (top of container) */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{ top: '-12px' }}
      >
        <div className="relative">
          <svg width="20" height="14" viewBox="0 0 20 14">
            <polygon
              points="10,14 0,0 20,0"
              fill="#FF4500"
              filter="drop-shadow(0 0 6px rgba(255,69,0,0.8))"
            />
          </svg>
        </div>
      </div>

      {/* Heading readout */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ bottom: '-45px' }}
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

      {/* Device edge pointer indicator */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ bottom: '-85px' }}
      >
        <div 
          className="glass-panel rounded-lg px-3 py-1.5 inline-block"
          style={{ 
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,69,0,0.3)'
          }}
        >
          <div className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">
            Device Edge
          </div>
          <div 
            className="text-xs font-bold tracking-wider"
            style={{ color: '#FF4500' }}
          >
            → {devicePointer.edge}
            <span className="text-[#00FF41]">{devicePointer.tilt}</span>
          </div>
        </div>
      </div>

      {/* Level status */}
      <div 
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '-115px' }}
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
