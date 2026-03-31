import React, { useMemo } from 'react';

const Compass3D = ({ heading = 0, orientation = { alpha: 0, beta: 0, gamma: 0 } }) => {
  // Normalize heading to 0-360
  const normalizedHeading = ((heading % 360) + 360) % 360;
  
  // Clamp beta and gamma for bubble position (-45 to 45 degrees range)
  const clampedBeta = Math.max(-45, Math.min(45, orientation.beta || 0));
  const clampedGamma = Math.max(-45, Math.min(45, orientation.gamma || 0));
  
  // Calculate bubble position (inverted - bubble goes opposite to tilt)
  const bubbleX = (clampedGamma / 45) * 35; // Max 35px offset
  const bubbleY = (clampedBeta / 45) * 35;
  
  // Check if level (within 3 degrees)
  const isLevel = Math.abs(clampedBeta) < 3 && Math.abs(clampedGamma) < 3;
  
  // Get direction label
  const getDirectionLabel = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  // Cardinal directions for the compass ring
  const cardinalMarks = useMemo(() => {
    const marks = [];
    for (let i = 0; i < 36; i++) {
      const angle = i * 10;
      const isCardinal = angle % 90 === 0;
      const isIntercardinal = angle % 45 === 0 && !isCardinal;
      marks.push({
        angle,
        isCardinal,
        isIntercardinal,
        label: isCardinal ? ['N', 'E', 'S', 'W'][angle / 90] : null
      });
    }
    return marks;
  }, []);

  // 3D transform based on device orientation
  const sphereTransform = `
    perspective(800px)
    rotateX(${Math.min(25, Math.max(-25, clampedBeta * 0.4))}deg)
    rotateY(${Math.min(20, Math.max(-20, clampedGamma * 0.3))}deg)
  `;

  return (
    <div
      data-testid="compass-3d"
      className="relative"
      style={{ width: '140px', height: '140px' }}
    >
      {/* Outer glass sphere container */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.4) 100%)',
          boxShadow: `
            0 0 40px rgba(0, 255, 65, 0.15),
            inset 0 -8px 20px rgba(0, 0, 0, 0.6),
            inset 0 8px 20px rgba(255, 255, 255, 0.1),
            0 4px 20px rgba(0, 0, 0, 0.5)
          `,
          border: '2px solid rgba(255, 255, 255, 0.15)',
          transform: sphereTransform,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Inner sphere with compass face */}
        <div
          className="absolute rounded-full"
          style={{
            top: '8px',
            left: '8px',
            right: '8px',
            bottom: '8px',
            background: 'radial-gradient(circle at 30% 30%, #1a1a1a 0%, #0a0a0a 70%, #050505 100%)',
            boxShadow: `
              inset 0 4px 15px rgba(0, 0, 0, 0.8),
              inset 0 -2px 10px rgba(255, 255, 255, 0.05)
            `,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Compass rose / degree markings - rotates with heading */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            style={{ transform: `rotate(${-normalizedHeading}deg)` }}
          >
            {/* Degree tick marks */}
            {cardinalMarks.map(({ angle, isCardinal, isIntercardinal, label }) => {
              const radAngle = (angle - 90) * Math.PI / 180;
              const outerR = 46;
              const innerR = isCardinal ? 36 : isIntercardinal ? 40 : 43;
              const x1 = 50 + outerR * Math.cos(radAngle);
              const y1 = 50 + outerR * Math.sin(radAngle);
              const x2 = 50 + innerR * Math.cos(radAngle);
              const y2 = 50 + innerR * Math.sin(radAngle);
              
              return (
                <g key={angle}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={angle === 0 ? '#FF4500' : isCardinal ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
                    strokeWidth={isCardinal ? 2.5 : isIntercardinal ? 1.5 : 1}
                    strokeLinecap="round"
                  />
                  {label && (
                    <text
                      x={50 + 30 * Math.cos(radAngle)}
                      y={50 + 30 * Math.sin(radAngle)}
                      fill={angle === 0 ? '#FF4500' : '#FFFFFF'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="Chivo, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        transform: `rotate(${normalizedHeading}deg)`,
                        transformOrigin: `${50 + 30 * Math.cos(radAngle)}px ${50 + 30 * Math.sin(radAngle)}px`
                      }}
                    >
                      {label}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Compass needle */}
            <g style={{ transform: `rotate(${normalizedHeading}deg)`, transformOrigin: '50px 50px' }}>
              {/* North pointer (red) */}
              <polygon
                points="50,18 46,50 50,46 54,50"
                fill="#FF4500"
                filter="drop-shadow(0 0 3px rgba(255,69,0,0.8))"
              />
              {/* South pointer (white) */}
              <polygon
                points="50,82 46,50 50,54 54,50"
                fill="rgba(255,255,255,0.6)"
              />
              {/* Center pivot */}
              <circle cx="50" cy="50" r="4" fill="#333" stroke="#FF4500" strokeWidth="1.5" />
            </g>
          </svg>

          {/* Bubble level container (glass dome effect) */}
          <div
            className="absolute rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '50px',
              height: '50px',
              background: 'radial-gradient(circle at 40% 40%, rgba(0,255,65,0.08) 0%, rgba(0,0,0,0.3) 100%)',
              border: `2px solid ${isLevel ? 'rgba(0,255,65,0.5)' : 'rgba(255,255,255,0.15)'}`,
              boxShadow: isLevel 
                ? '0 0 15px rgba(0,255,65,0.3), inset 0 2px 10px rgba(0,0,0,0.5)'
                : 'inset 0 2px 10px rgba(0,0,0,0.5)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          >
            {/* Level crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="absolute w-full h-[1px]"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              />
              <div 
                className="absolute h-full w-[1px]"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              />
              {/* Center target circle */}
              <div 
                className="absolute w-3 h-3 rounded-full border"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              />
            </div>

            {/* The bubble */}
            <div
              className="absolute rounded-full"
              style={{
                width: '14px',
                height: '14px',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${bubbleX}px), calc(-50% + ${bubbleY}px))`,
                background: isLevel
                  ? 'radial-gradient(circle at 30% 30%, #00FF41 0%, #00CC33 50%, #009922 100%)'
                  : 'radial-gradient(circle at 30% 30%, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                boxShadow: isLevel
                  ? '0 0 10px rgba(0,255,65,0.8), inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)'
                  : '0 0 8px rgba(255,165,0,0.6), inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
                transition: 'transform 0.15s ease-out, background 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              {/* Bubble highlight */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  top: '2px',
                  left: '3px',
                  background: 'rgba(255,255,255,0.6)',
                  filter: 'blur(1px)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Glass reflection overlay */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '5%',
            left: '10%',
            width: '40%',
            height: '25%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
            borderRadius: '50%',
            transform: 'rotate(-20deg)'
          }}
        />
      </div>

      {/* Fixed heading indicator (top) */}
      <div 
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: '-8px' }}
      >
        <svg width="16" height="12" viewBox="0 0 16 12">
          <polygon
            points="8,12 0,0 16,0"
            fill="#FF4500"
            filter="drop-shadow(0 0 4px rgba(255,69,0,0.8))"
          />
        </svg>
      </div>

      {/* Heading readout (below compass) */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ bottom: '-32px' }}
      >
        <div className="font-mono text-xl font-bold tracking-wider hud-text"
          style={{ color: '#00FF41', textShadow: '0 0 10px rgba(0,255,65,0.5)' }}
        >
          {Math.round(normalizedHeading)}°
        </div>
        <div className="text-[10px] font-bold text-white/60 tracking-widest">
          {getDirectionLabel(normalizedHeading)}
        </div>
      </div>

      {/* Tilt indicators (small text) */}
      <div 
        className="absolute text-center font-mono text-[9px]"
        style={{ 
          bottom: '-52px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          color: isLevel ? '#00FF41' : '#FFD700',
          opacity: 0.7
        }}
      >
        {isLevel ? '● LEVEL' : `TILT: ${Math.abs(clampedBeta).toFixed(0)}° / ${Math.abs(clampedGamma).toFixed(0)}°`}
      </div>
    </div>
  );
};

export default Compass3D;
