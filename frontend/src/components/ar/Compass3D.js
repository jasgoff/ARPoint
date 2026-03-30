import React from 'react';

const Compass3D = ({ heading = 0, orientation = { alpha: 0, beta: 0, gamma: 0 } }) => {
  // Normalize heading to 0-360
  const normalizedHeading = ((heading % 360) + 360) % 360;
  
  // Cardinal directions
  const directions = [
    { label: 'N', angle: 0, color: '#FF4500' },
    { label: 'NE', angle: 45, color: '#A3A3A3' },
    { label: 'E', angle: 90, color: '#FFFFFF' },
    { label: 'SE', angle: 135, color: '#A3A3A3' },
    { label: 'S', angle: 180, color: '#FFFFFF' },
    { label: 'SW', angle: 225, color: '#A3A3A3' },
    { label: 'W', angle: 270, color: '#FFFFFF' },
    { label: 'NW', angle: 315, color: '#A3A3A3' }
  ];

  // Get direction label
  const getDirectionLabel = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  // 3D transform based on device orientation
  const transform3D = `
    perspective(500px)
    rotateX(${Math.min(30, Math.max(-30, orientation.beta * 0.3))}deg)
    rotateY(${Math.min(20, Math.max(-20, orientation.gamma * 0.2))}deg)
  `;

  return (
    <div
      data-testid="compass-3d"
      className="relative w-28 h-28"
      style={{ transform: transform3D }}
    >
      {/* Outer ring with glow */}
      <div className="absolute inset-0 rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(0,255,65,0.2)]" />
      
      {/* Degree markers */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        style={{ transform: `rotate(${-normalizedHeading}deg)` }}
      >
        {/* Degree tick marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = i * 10;
          const isMajor = angle % 30 === 0;
          const x1 = 50 + 44 * Math.sin(angle * Math.PI / 180);
          const y1 = 50 - 44 * Math.cos(angle * Math.PI / 180);
          const x2 = 50 + (isMajor ? 38 : 41) * Math.sin(angle * Math.PI / 180);
          const y2 = 50 - (isMajor ? 38 : 41) * Math.cos(angle * Math.PI / 180);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={angle === 0 ? '#FF4500' : 'rgba(255,255,255,0.4)'}
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}

        {/* Direction labels */}
        {directions.map(({ label, angle, color }) => {
          const x = 50 + 30 * Math.sin(angle * Math.PI / 180);
          const y = 50 - 30 * Math.cos(angle * Math.PI / 180);
          
          return (
            <text
              key={label}
              x={x}
              y={y}
              fill={color}
              fontSize={label.length === 1 ? "10" : "7"}
              fontWeight="bold"
              fontFamily="Chivo, sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ transform: `rotate(${normalizedHeading}deg)`, transformOrigin: `${x}px ${y}px` }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Center indicator triangle (fixed, points up) */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
        <svg width="12" height="16" viewBox="0 0 12 16">
          <polygon
            points="6,0 12,16 0,16"
            fill="#FF4500"
            filter="drop-shadow(0 0 4px rgba(255,69,0,0.8))"
          />
        </svg>
      </div>

      {/* Heading readout */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-lg font-bold text-[#00FF41] tracking-wider hud-text">
            {Math.round(normalizedHeading)}°
          </div>
          <div className="text-[10px] font-bold text-white/60 tracking-widest">
            {getDirectionLabel(normalizedHeading)}
          </div>
        </div>
      </div>

      {/* Compass ring glow animation */}
      <div className="absolute inset-0 rounded-full compass-ring border border-[#00FF41]/30" />
    </div>
  );
};

export default Compass3D;
