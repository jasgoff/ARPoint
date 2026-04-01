import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  PINS: '@ar_survey_pins',
  TRACES: '@ar_survey_traces',
  MEASUREMENTS: '@ar_survey_measurements',
  SETTINGS: '@ar_survey_settings'
};

const DEFAULT_SETTINGS = {
  units: 'metric',
  compassMode: '3d',
  showCoordinates: true,
  showAltitude: true,
  showCompass: true,
  showARPins: true,
  arPinRange: 610, // 2000ft in meters
  mapType: 'satellite'
};

export const AppProvider = ({ children }) => {
  const [position, setPosition] = useState(null);
  const [heading, setHeading] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [mode, setMode] = useState('view');
  const [measureStart, setMeasureStart] = useState(null);
  const [measureEnd, setMeasureEnd] = useState(null);
  const [tracePoints, setTracePoints] = useState([]);
  const [isTracing, setIsTracing] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load settings on init
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveToStorage = useCallback(async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }, []);

  const loadFromStorage = useCallback(async (key, defaultValue = []) => {
    try {
      const saved = await AsyncStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, []);

  // Pin management
  const getPins = useCallback(async () => {
    return await loadFromStorage(STORAGE_KEYS.PINS, []);
  }, [loadFromStorage]);

  const addPin = useCallback(async (pin) => {
    const pins = await getPins();
    const newPin = {
      ...pin,
      id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    pins.push(newPin);
    await saveToStorage(STORAGE_KEYS.PINS, pins);
    return newPin;
  }, [getPins, saveToStorage]);

  const deletePin = useCallback(async (pinId) => {
    const pins = await getPins();
    const filtered = pins.filter(p => p.id !== pinId);
    await saveToStorage(STORAGE_KEYS.PINS, filtered);
  }, [getPins, saveToStorage]);

  // Trace management
  const getTraces = useCallback(async () => {
    return await loadFromStorage(STORAGE_KEYS.TRACES, []);
  }, [loadFromStorage]);

  const addTrace = useCallback(async (trace) => {
    const traces = await getTraces();
    const newTrace = {
      ...trace,
      id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    traces.push(newTrace);
    await saveToStorage(STORAGE_KEYS.TRACES, traces);
    return newTrace;
  }, [getTraces, saveToStorage]);

  const deleteTrace = useCallback(async (traceId) => {
    const traces = await getTraces();
    const filtered = traces.filter(t => t.id !== traceId);
    await saveToStorage(STORAGE_KEYS.TRACES, filtered);
  }, [getTraces, saveToStorage]);

  // Measurement management
  const getMeasurements = useCallback(async () => {
    return await loadFromStorage(STORAGE_KEYS.MEASUREMENTS, []);
  }, [loadFromStorage]);

  const addMeasurement = useCallback(async (measurement) => {
    const measurements = await getMeasurements();
    const newMeasurement = {
      ...measurement,
      id: `measure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    measurements.push(newMeasurement);
    await saveToStorage(STORAGE_KEYS.MEASUREMENTS, measurements);
    return newMeasurement;
  }, [getMeasurements, saveToStorage]);

  const deleteMeasurement = useCallback(async (measurementId) => {
    const measurements = await getMeasurements();
    const filtered = measurements.filter(m => m.id !== measurementId);
    await saveToStorage(STORAGE_KEYS.MEASUREMENTS, filtered);
  }, [getMeasurements, saveToStorage]);

  // Settings
  const updateSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveToStorage(STORAGE_KEYS.SETTINGS, updated);
  }, [settings, saveToStorage]);

  // Utility functions
  const calculateDistance = useCallback((point1, point2) => {
    const R = 6371000; // Earth's radius in meters
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const deltaLng = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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
    position, setPosition,
    heading, setHeading,
    altitude, setAltitude,
    accuracy, setAccuracy,
    orientation, setOrientation,
    mode, setMode,
    measureStart, setMeasureStart,
    measureEnd, setMeasureEnd,
    tracePoints, setTracePoints,
    isTracing, setIsTracing,
    getPins, addPin, deletePin,
    getTraces, addTrace, deleteTrace,
    getMeasurements, addMeasurement, deleteMeasurement,
    settings, updateSettings,
    calculateDistance, calculateBearing,
    formatDistance, formatBearing
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
