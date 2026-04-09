import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  PINS: 'ar_survey_pins',
  TRACES: 'ar_survey_traces',
  MEASUREMENTS: 'ar_survey_measurements',
  SETTINGS: 'ar_survey_settings'
};

const DEFAULT_SETTINGS = {
  units: 'metric', // 'metric' or 'imperial'
  compassMode: '3d', // '2d' or '3d'
  showCoordinates: true,
  showAltitude: true,
  showCompass: true, // New: toggle compass visibility
  showARPins: true, // New: toggle AR pin markers
  arPinRange: 610, // Range in meters (2000ft = ~610m)
  mapType: 'satellite', // 'satellite' or 'street'
  compassCalibration: -90, // Compass offset in degrees (default -90 for landscape back-camera-forward)
  screenOrientation: 'landscape' // 'portrait' or 'landscape'
};

export const AppProvider = ({ children }) => {
  // Current GPS position
  const [position, setPosition] = useState(null);
  const [heading, setHeading] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  
  // Device orientation
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  
  // App mode
  const [mode, setMode] = useState('view'); // 'view', 'pin', 'measure', 'trace'
  
  // Current measurement state
  const [measureStart, setMeasureStart] = useState(null);
  const [measureEnd, setMeasureEnd] = useState(null);
  
  // Active trace points
  const [tracePoints, setTracePoints] = useState([]);
  const [isTracing, setIsTracing] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Local storage helpers
  const saveToStorage = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }, []);

  const loadFromStorage = useCallback((key, defaultValue = []) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, []);

  // Pin management (local storage)
  const getPins = useCallback(() => {
    return loadFromStorage(STORAGE_KEYS.PINS, []);
  }, [loadFromStorage]);

  const addPin = useCallback((pin) => {
    const pins = getPins();
    const newPin = {
      ...pin,
      id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    pins.push(newPin);
    saveToStorage(STORAGE_KEYS.PINS, pins);
    return newPin;
  }, [getPins, saveToStorage]);

  const deletePin = useCallback((pinId) => {
    const pins = getPins().filter(p => p.id !== pinId);
    saveToStorage(STORAGE_KEYS.PINS, pins);
  }, [getPins, saveToStorage]);

  // Trace management
  const getTraces = useCallback(() => {
    return loadFromStorage(STORAGE_KEYS.TRACES, []);
  }, [loadFromStorage]);

  const addTrace = useCallback((trace) => {
    const traces = getTraces();
    const newTrace = {
      ...trace,
      id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    traces.push(newTrace);
    saveToStorage(STORAGE_KEYS.TRACES, traces);
    return newTrace;
  }, [getTraces, saveToStorage]);

  const deleteTrace = useCallback((traceId) => {
    const traces = getTraces().filter(t => t.id !== traceId);
    saveToStorage(STORAGE_KEYS.TRACES, traces);
  }, [getTraces, saveToStorage]);

  // Measurement management
  const getMeasurements = useCallback(() => {
    return loadFromStorage(STORAGE_KEYS.MEASUREMENTS, []);
  }, [loadFromStorage]);

  const addMeasurement = useCallback((measurement) => {
    const measurements = getMeasurements();
    const newMeasurement = {
      ...measurement,
      id: `measure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    measurements.push(newMeasurement);
    saveToStorage(STORAGE_KEYS.MEASUREMENTS, measurements);
    return newMeasurement;
  }, [getMeasurements, saveToStorage]);

  const deleteMeasurement = useCallback((measurementId) => {
    const measurements = getMeasurements().filter(m => m.id !== measurementId);
    saveToStorage(STORAGE_KEYS.MEASUREMENTS, measurements);
  }, [getMeasurements, saveToStorage]);

  // Settings
  const updateSettings = useCallback((newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
  }, [settings, saveToStorage]);

  // Utility functions
  const calculateDistance = useCallback((point1, point2) => {
    // Haversine formula
    const R = 6371000; // Earth's radius in meters
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const deltaLng = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }, []);

  const calculateBearing = useCallback((point1, point2) => {
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    const deltaLng = (point2.longitude - point1.longitude) * Math.PI / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
  }, []);

  const formatDistance = useCallback((meters) => {
    if (settings.units === 'imperial') {
      const feet = meters * 3.28084;
      if (feet < 5280) {
        return `${feet.toFixed(1)} ft`;
      }
      return `${(feet / 5280).toFixed(2)} mi`;
    }
    if (meters < 1000) {
      return `${meters.toFixed(1)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  }, [settings.units]);

  const formatBearing = useCallback((degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return `${degrees.toFixed(1)}° ${directions[index]}`;
  }, []);

  const value = {
    // Position state
    position,
    setPosition,
    heading,
    setHeading,
    altitude,
    setAltitude,
    accuracy,
    setAccuracy,
    orientation,
    setOrientation,
    
    // Mode state
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
    
    // Data management
    getPins,
    addPin,
    deletePin,
    getTraces,
    addTrace,
    deleteTrace,
    getMeasurements,
    addMeasurement,
    deleteMeasurement,
    
    // Settings
    settings,
    updateSettings,
    
    // Utilities
    calculateDistance,
    calculateBearing,
    formatDistance,
    formatBearing
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
