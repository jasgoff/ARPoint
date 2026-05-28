import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import Compass3D from '@/components/ar/Compass3D';
import {
  Crosshair,
  MapPin,
  Ruler,
  Route,
  Save,
  X,
  Check,
  Camera,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ARView = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const {
    position,
    heading,
    altitude,
    accuracy,
    orientation,
    mode,
    setMode,
    measureStart,
    setMeasureStart,
    measureEnd,
    setMeasureEnd,
    tracePoints,
    setTracePoints,
    isTracing,
    setIsTracing,
    addPin,
    addMeasurement,
    addTrace,
    getPins,
    calculateDistance,
    calculateBearing,
    formatDistance,
    formatBearing,
    settings
  } = useApp();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [currentDistance, setCurrentDistance] = useState(null);
  const [currentBearing, setCurrentBearing] = useState(null);
  const [nearbyPins, setNearbyPins] = useState([]);

  // Load and filter nearby pins (within range, default 2000ft = 610m)
  useEffect(() => {
    if (!position || !settings.showARPins) {
      setNearbyPins([]);
      return;
    }

    const allPins = getPins();
    const range = settings.arPinRange || 610; // 2000ft in meters

    const pinsInRange = allPins
      .map(pin => {
        const distance = calculateDistance(position, {
          latitude: pin.latitude,
          longitude: pin.longitude
        });
        const bearing = calculateBearing(position, {
          latitude: pin.latitude,
          longitude: pin.longitude
        });
        return { ...pin, distance, bearing };
      })
      .filter(pin => pin.distance <= range)
      .sort((a, b) => a.distance - b.distance);

    setNearbyPins(pinsInRange);
  }, [position, getPins, calculateDistance, calculateBearing, settings.showARPins, settings.arPinRange]);

  // Calculate AR position for a pin based on bearing relative to device heading
  const getARPosition = useCallback((pinBearing, pinDistance) => {
    // Calculate the angle difference between pin bearing and device heading
    let angleDiff = pinBearing - (heading || 0);
    
    // Normalize to -180 to 180
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;

    // Only show pins within field of view (~120 degrees)
    const fov = 60; // Half of field of view
    if (Math.abs(angleDiff) > fov) {
      return null; // Out of view
    }

    // Calculate horizontal position (percentage from center)
    // -60° = left edge, 0° = center, +60° = right edge
    const xPercent = 50 + (angleDiff / fov) * 50;

    // Calculate vertical position based on distance (closer = lower, farther = higher)
    // This simulates perspective
    const maxRange = settings.arPinRange || 610;
    const distanceRatio = pinDistance / maxRange;
    const yPercent = 30 + distanceRatio * 30; // 30% to 60% from top

    // Calculate size based on distance (closer = larger)
    const scale = 1.5 - distanceRatio;

    return { x: xPercent, y: yPercent, scale, angleDiff };
  }, [heading, settings.arPinRange]);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraActive(true);
        }
      } catch (error) {
        console.error('Camera error:', error);
        setCameraError(error.message || 'Camera access denied');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle pin drop
  const handlePinDrop = useCallback(() => {
    if (!position) return;

    setSaveName('');
    setShowSaveDialog(true);
  }, [position]);

  const savePinDrop = useCallback(() => {
    if (!position || !saveName.trim()) return;

    addPin({
      name: saveName.trim(),
      latitude: position.latitude,
      longitude: position.longitude,
      altitude: altitude || 0,
      bearing: heading
    });

    setShowSaveDialog(false);
    setSaveName('');
    setMode('view');
  }, [position, saveName, altitude, heading, addPin, setMode]);

  // Handle measurement
  const handleMeasureStart = useCallback(() => {
    if (!position) return;

    if (!measureStart) {
      setMeasureStart({
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: altitude || 0
      });
    } else if (!measureEnd) {
      const endPoint = {
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: altitude || 0
      };
      setMeasureEnd(endPoint);

      // Calculate distance and bearing
      const dist = calculateDistance(measureStart, endPoint);
      const bear = calculateBearing(measureStart, endPoint);
      setCurrentDistance(dist);
      setCurrentBearing(bear);

      // Show save dialog
      setSaveName('');
      setShowSaveDialog(true);
    }
  }, [position, altitude, measureStart, measureEnd, setMeasureStart, setMeasureEnd, calculateDistance, calculateBearing]);

  const saveMeasurement = useCallback(() => {
    if (!measureStart || !measureEnd || !saveName.trim()) return;

    addMeasurement({
      name: saveName.trim(),
      start_point: measureStart,
      end_point: measureEnd,
      distance: currentDistance,
      bearing: currentBearing
    });

    setMeasureStart(null);
    setMeasureEnd(null);
    setCurrentDistance(null);
    setCurrentBearing(null);
    setShowSaveDialog(false);
    setSaveName('');
    setMode('view');
  }, [measureStart, measureEnd, saveName, currentDistance, currentBearing, addMeasurement, setMeasureStart, setMeasureEnd, setMode]);

  // Handle tracing
  const handleTraceToggle = useCallback(() => {
    if (!isTracing) {
      setIsTracing(true);
      setTracePoints([]);
    } else {
      setIsTracing(false);
      if (tracePoints.length > 1) {
        setSaveName('');
        setShowSaveDialog(true);
      }
    }
  }, [isTracing, setIsTracing, setTracePoints, tracePoints]);

  // Add trace points while tracing
  useEffect(() => {
    if (isTracing && position) {
      const lastPoint = tracePoints[tracePoints.length - 1];
      if (!lastPoint || 
          calculateDistance(lastPoint, position) > 2) { // Add point every 2 meters
        setTracePoints(prev => [...prev, {
          latitude: position.latitude,
          longitude: position.longitude,
          altitude: altitude || 0,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  }, [isTracing, position, altitude, tracePoints, setTracePoints, calculateDistance]);

  const saveTrace = useCallback(() => {
    if (tracePoints.length < 2 || !saveName.trim()) return;

    // Calculate total distance
    let totalDist = 0;
    for (let i = 1; i < tracePoints.length; i++) {
      totalDist += calculateDistance(tracePoints[i - 1], tracePoints[i]);
    }

    addTrace({
      name: saveName.trim(),
      points: tracePoints,
      total_distance: totalDist
    });

    setTracePoints([]);
    setShowSaveDialog(false);
    setSaveName('');
    setMode('view');
  }, [tracePoints, saveName, calculateDistance, addTrace, setTracePoints, setMode]);

  // Cancel current action
  const cancelAction = useCallback(() => {
    setMode('view');
    setMeasureStart(null);
    setMeasureEnd(null);
    setCurrentDistance(null);
    setCurrentBearing(null);
    setIsTracing(false);
    setTracePoints([]);
    setShowSaveDialog(false);
    setSaveName('');
  }, [setMode, setMeasureStart, setMeasureEnd, setIsTracing, setTracePoints]);

  // Handle save based on mode
  const handleSave = useCallback(() => {
    if (mode === 'pin') {
      savePinDrop();
    } else if (mode === 'measure') {
      saveMeasurement();
    } else if (mode === 'trace') {
      saveTrace();
    }
  }, [mode, savePinDrop, saveMeasurement, saveTrace]);

  // Render AR pin markers
  const renderARPins = useMemo(() => {
    if (!settings.showARPins || nearbyPins.length === 0) return null;

    return nearbyPins.map(pin => {
      const arPos = getARPosition(pin.bearing, pin.distance);
      if (!arPos) return null; // Out of field of view

      return (
        <div
          key={pin.id}
          className="ar-pin-marker absolute pointer-events-none"
          style={{
            left: `${arPos.x}%`,
            top: `${arPos.y}%`,
            transform: `translate(-50%, -100%) scale(${arPos.scale})`,
            zIndex: Math.round(100 - pin.distance),
            transition: 'left 0.1s ease-out, top 0.1s ease-out'
          }}
        >
          {/* Pin icon */}
          <div 
            className="relative"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }}
          >
            <svg width="40" height="52" viewBox="0 0 40 52" fill="none">
              <path 
                d="M20 0C8.954 0 0 8.954 0 20C0 35 20 52 20 52C20 52 40 35 40 20C40 8.954 31.046 0 20 0Z" 
                fill="#FF4500"
              />
              <circle cx="20" cy="20" r="8" fill="white"/>
            </svg>
            
            {/* Direction indicator */}
            {Math.abs(arPos.angleDiff) > 5 && (
              <div 
                className="absolute -top-1 left-1/2 -translate-x-1/2"
                style={{
                  transform: `translateX(-50%) rotate(${arPos.angleDiff > 0 ? 45 : -45}deg)`
                }}
              >
                <Navigation 
                  className="w-4 h-4 text-white" 
                  style={{ 
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Pin info label */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap"
            style={{ top: '100%' }}
          >
            <div 
              className="glass-panel rounded-lg px-2 py-1 text-center"
              style={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,69,0,0.5)'
              }}
            >
              <div className="text-white text-xs font-bold truncate max-w-[100px]">
                {pin.name}
              </div>
              <div className="text-[#00FF41] text-[10px] font-mono">
                {formatDistance(pin.distance)}
              </div>
            </div>
          </div>
        </div>
      );
    });
  }, [nearbyPins, settings.showARPins, getARPosition, formatDistance]);

  if (cameraError) {
    return (
      <div className="camera-error" data-testid="camera-error">
        <Camera className="w-16 h-16 text-white/30 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Camera Access Required</h3>
        <p className="text-white/60 mb-4">{cameraError}</p>
        <p className="text-sm text-white/40">
          Please enable camera access in your browser settings to use AR features.
        </p>
      </div>
    );
  }

  return (
    <div className="ar-camera-container" data-testid="ar-view">
      {/* Camera video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* HUD Overlay */}
      <div className="ar-hud">
        {/* Compass (top center) - conditionally rendered */}
        {settings.showCompass && (
          <div className="compass-hud">
            <Compass3D 
              heading={heading} 
              orientation={orientation}
              calibrationOffset={settings.compassCalibration ?? 0}
            />
          </div>
        )}

        {/* Coordinates (top left) */}
        {settings.showCoordinates && (
          <div className="coords-hud glass-panel rounded-xl p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 uppercase tracking-wider w-8">LAT</span>
                <span className="data-readout text-sm">
                  {position ? position.latitude.toFixed(6) : '---.------'}°
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 uppercase tracking-wider w-8">LNG</span>
                <span className="data-readout text-sm">
                  {position ? position.longitude.toFixed(6) : '---.------'}°
                </span>
              </div>
              {settings.showAltitude && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider w-8">ALT</span>
                  <span className="data-readout text-sm">
                    {altitude ? `${altitude.toFixed(1)}m` : '---.-m'}
                  </span>
                </div>
              )}
              {accuracy && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider w-8">ACC</span>
                  <span className="data-readout text-sm text-yellow-400">
                    ±{accuracy.toFixed(1)}m
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nearby pins count indicator */}
        {settings.showARPins && nearbyPins.length > 0 && (
          <div 
            className="absolute top-4 right-4 glass-panel rounded-lg px-3 py-2"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF4500]" />
              <span className="text-white text-sm font-bold">{nearbyPins.length}</span>
              <span className="text-white/50 text-xs">nearby</span>
            </div>
          </div>
        )}

        {/* Mode indicator */}
        {mode !== 'view' && (
          <div className={`mode-indicator glass-panel rounded-lg ${
            mode === 'pin' ? 'text-[#FF4500]' :
            mode === 'measure' ? 'text-[#007AFF]' :
            'text-[#00FF41]'
          }`} style={{ top: settings.showCompass ? '140px' : '16px', right: '16px' }}>
            {mode === 'pin' && 'PIN DROP MODE'}
            {mode === 'measure' && (measureStart ? 'TAP END POINT' : 'TAP START POINT')}
            {mode === 'trace' && (isTracing ? 'TRACING...' : 'TRACE MODE')}
          </div>
        )}

        {/* AR Pin Markers */}
        {renderARPins}

        {/* Center crosshair */}
        {(mode === 'pin' || mode === 'measure') && (
          <div className="crosshair">
            <div className="crosshair-line h" />
            <div className="crosshair-line v" />
            <div className="crosshair-circle" />
          </div>
        )}

        {/* Measurement result popup */}
        {currentDistance !== null && currentBearing !== null && (
          <div className="distance-popup" style={{ top: '40%', left: '50%' }}>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatDistance(currentDistance)}</div>
              <div className="text-sm text-white/70 mt-1">{formatBearing(currentBearing)}</div>
            </div>
          </div>
        )}

        {/* Trace distance indicator */}
        {isTracing && tracePoints.length > 1 && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
            <div className="glass-panel rounded-lg px-4 py-2">
              <span className="data-readout">
                {formatDistance(
                  tracePoints.reduce((acc, point, i) => {
                    if (i === 0) return 0;
                    return acc + calculateDistance(tracePoints[i - 1], point);
                  }, 0)
                )}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons (bottom center) */}
        <div className="actions-hud">
          {mode === 'view' && (
            <>
              <Button
                data-testid="ar-drop-pin-btn"
                onClick={() => setMode('pin')}
                className="touch-btn w-16 h-16 rounded-full bg-[#FF4500] hover:bg-[#FF5722] text-white"
              >
                <MapPin className="w-7 h-7" />
              </Button>
              <Button
                data-testid="ar-measure-btn"
                onClick={() => setMode('measure')}
                className="touch-btn w-16 h-16 rounded-full bg-[#007AFF] hover:bg-[#3395FF] text-white"
              >
                <Ruler className="w-7 h-7" />
              </Button>
              <Button
                data-testid="ar-trace-btn"
                onClick={() => setMode('trace')}
                className="touch-btn w-16 h-16 rounded-full bg-[#00FF41]/20 border-2 border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/30"
              >
                <Route className="w-7 h-7" />
              </Button>
            </>
          )}

          {mode === 'pin' && (
            <>
              <Button
                data-testid="cancel-pin-btn"
                onClick={cancelAction}
                className="touch-btn w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                data-testid="confirm-pin-btn"
                onClick={handlePinDrop}
                disabled={!position}
                className="touch-btn w-20 h-20 rounded-full bg-[#FF4500] hover:bg-[#FF5722] text-white neon-glow-orange"
              >
                <MapPin className="w-10 h-10" />
              </Button>
            </>
          )}

          {mode === 'measure' && (
            <>
              <Button
                data-testid="cancel-measure-btn"
                onClick={cancelAction}
                className="touch-btn w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                data-testid="confirm-measure-btn"
                onClick={handleMeasureStart}
                disabled={!position}
                className="touch-btn w-20 h-20 rounded-full bg-[#007AFF] hover:bg-[#3395FF] text-white neon-glow-blue"
              >
                <Crosshair className="w-10 h-10" />
              </Button>
            </>
          )}

          {mode === 'trace' && (
            <>
              <Button
                data-testid="cancel-trace-btn"
                onClick={cancelAction}
                className="touch-btn w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                data-testid="toggle-trace-btn"
                onClick={handleTraceToggle}
                disabled={!position}
                className={`touch-btn w-20 h-20 rounded-full ${
                  isTracing
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-[#00FF41] hover:bg-[#00FF41]/80'
                } text-white neon-glow-green`}
              >
                {isTracing ? (
                  <Check className="w-10 h-10" />
                ) : (
                  <Route className="w-10 h-10" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
          <div className="glass-panel w-full max-w-md rounded-t-3xl p-6 slide-up">
            <h3 className="font-heading text-xl font-bold text-white mb-4">
              {mode === 'pin' && 'Save Pin'}
              {mode === 'measure' && 'Save Measurement'}
              {mode === 'trace' && 'Save Trace'}
            </h3>

            {/* Show measurement result */}
            {mode === 'measure' && currentDistance !== null && (
              <div className="glass-panel rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="data-readout text-2xl">{formatDistance(currentDistance)}</div>
                  <div className="text-white/60 mt-1">{formatBearing(currentBearing)}</div>
                </div>
              </div>
            )}

            {/* Show trace result */}
            {mode === 'trace' && tracePoints.length > 1 && (
              <div className="glass-panel rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="data-readout text-2xl">
                    {formatDistance(
                      tracePoints.reduce((acc, point, i) => {
                        if (i === 0) return 0;
                        return acc + calculateDistance(tracePoints[i - 1], point);
                      }, 0)
                    )}
                  </div>
                  <div className="text-white/60 mt-1">{tracePoints.length} points</div>
                </div>
              </div>
            )}

            <input
              type="text"
              data-testid="save-name-input"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter name..."
              className="w-full h-14 px-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF4500] font-medium"
              autoFocus
            />

            <div className="flex gap-3 mt-4">
              <Button
                data-testid="cancel-save-btn"
                onClick={cancelAction}
                className="flex-1 h-14 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                data-testid="confirm-save-btn"
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="flex-1 h-14 bg-[#FF4500] hover:bg-[#FF5722] text-white rounded-xl font-bold"
              >
                <Save className="w-5 h-5 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARView;
