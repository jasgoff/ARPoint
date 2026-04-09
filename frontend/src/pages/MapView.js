import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '@/context/AppContext';
import { MapPin, Crosshair, Trash2, Navigation, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom pin icon
const createPinIcon = (color = '#FF4500') => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="${color}"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });
};

// Current position icon
const currentPositionIcon = L.divIcon({
  className: 'current-position-icon',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #007AFF;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(0,122,255,0.8);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Map recenter component
const MapController = ({ position, shouldCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (shouldCenter && position) {
      map.setView([position.latitude, position.longitude], map.getZoom());
    }
  }, [shouldCenter, position, map]);

  return null;
};

// Map click handler
const MapClickHandler = ({ onMapClick, isAddingPin }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingPin) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
};

const MapView = () => {
  const {
    position,
    heading,
    settings,
    getPins,
    addPin,
    deletePin,
    getTraces,
    getMeasurements,
    formatDistance,
    formatBearing
  } = useApp();

  const [pins, setPins] = useState([]);
  const [traces, setTraces] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [mapType, setMapType] = useState(settings.mapType || 'satellite');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [pinName, setPinName] = useState('');

  // Load data
  useEffect(() => {
    setPins(getPins());
    setTraces(getTraces());
    setMeasurements(getMeasurements());
  }, [getPins, getTraces, getMeasurements]);

  // Tile layer URLs
  const tileUrls = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    street: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  const attributions = {
    satellite: 'Tiles &copy; Esri',
    street: '&copy; OpenStreetMap contributors, &copy; CARTO'
  };

  // Default center (San Francisco)
  const defaultCenter = useMemo(() => {
    if (position) {
      return [position.latitude, position.longitude];
    }
    return [37.7749, -122.4194];
  }, [position]);

  // Handle map click for adding pin
  const handleMapClick = useCallback((latlng) => {
    setPendingPin({
      latitude: latlng.lat,
      longitude: latlng.lng
    });
    setPinName('');
    setShowSaveDialog(true);
  }, []);

  // Save pin
  const handleSavePin = useCallback(() => {
    if (!pendingPin || !pinName.trim()) return;

    const newPin = addPin({
      name: pinName.trim(),
      latitude: pendingPin.latitude,
      longitude: pendingPin.longitude,
      altitude: 0
    });

    setPins(prev => [...prev, newPin]);
    setPendingPin(null);
    setPinName('');
    setShowSaveDialog(false);
    setIsAddingPin(false);
  }, [pendingPin, pinName, addPin]);

  // Delete pin
  const handleDeletePin = useCallback((pinId) => {
    deletePin(pinId);
    setPins(prev => prev.filter(p => p.id !== pinId));
  }, [deletePin]);

  // Center on current position
  const handleCenterOnPosition = useCallback(() => {
    setShouldCenter(true);
    setTimeout(() => setShouldCenter(false), 100);
  }, []);

  // Toggle map type
  const toggleMapType = useCallback(() => {
    setMapType(prev => prev === 'satellite' ? 'street' : 'satellite');
  }, []);

  return (
    <div className="map-container relative" data-testid="map-view">
      <MapContainer
        center={defaultCenter}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={tileUrls[mapType]}
          attribution={attributions[mapType]}
        />

        <MapController position={position} shouldCenter={shouldCenter} />
        <MapClickHandler onMapClick={handleMapClick} isAddingPin={isAddingPin} />

        {/* Current position marker */}
        {position && (
          <Marker
            position={[position.latitude, position.longitude]}
            icon={currentPositionIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="font-bold">Current Position</div>
                <div className="text-sm text-gray-600 font-mono">
                  {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Saved pins */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={createPinIcon('#FF4500')}
          >
            <Popup>
              <div className="min-w-[150px]">
                <div className="font-bold text-gray-900">{pin.name}</div>
                <div className="text-xs text-gray-600 font-mono mt-1">
                  {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
                </div>
                {pin.altitude > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Alt: {pin.altitude.toFixed(1)}m
                  </div>
                )}
                <button
                  onClick={() => handleDeletePin(pin.id)}
                  className="mt-2 flex items-center gap-1 text-red-500 text-sm hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Traces */}
        {traces.map((trace) => (
          <Polyline
            key={trace.id}
            positions={trace.points.map(p => [p.latitude, p.longitude])}
            pathOptions={{
              color: '#00FF41',
              weight: 4,
              opacity: 0.8
            }}
          >
            <Popup>
              <div>
                <div className="font-bold text-gray-900">{trace.name}</div>
                <div className="text-sm text-gray-600">
                  {formatDistance(trace.total_distance)}
                </div>
                <div className="text-xs text-gray-500">
                  {trace.points.length} points
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Measurements */}
        {measurements.map((m) => (
          <React.Fragment key={m.id}>
            <Polyline
              positions={[
                [m.start_point.latitude, m.start_point.longitude],
                [m.end_point.latitude, m.end_point.longitude]
              ]}
              pathOptions={{
                color: '#007AFF',
                weight: 3,
                opacity: 0.9,
                dashArray: '10, 10'
              }}
            >
              <Popup>
                <div>
                  <div className="font-bold text-gray-900">{m.name}</div>
                  <div className="text-sm text-blue-600 font-mono">
                    {formatDistance(m.distance)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatBearing(m.bearing)}
                  </div>
                </div>
              </Popup>
            </Polyline>
            <Marker
              position={[m.start_point.latitude, m.start_point.longitude]}
              icon={createPinIcon('#007AFF')}
            />
            <Marker
              position={[m.end_point.latitude, m.end_point.longitude]}
              icon={createPinIcon('#007AFF')}
            />
          </React.Fragment>
        ))}

        {/* Pending pin marker */}
        {pendingPin && (
          <Marker
            position={[pendingPin.latitude, pendingPin.longitude]}
            icon={createPinIcon('#FFD700')}
          />
        )}
      </MapContainer>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          data-testid="toggle-map-type-btn"
          onClick={toggleMapType}
          className="w-12 h-12 rounded-xl glass-panel hover:bg-white/20"
        >
          <Layers className="w-5 h-5 text-white" />
        </Button>
        <Button
          data-testid="center-position-btn"
          onClick={handleCenterOnPosition}
          disabled={!position}
          className="w-12 h-12 rounded-xl glass-panel hover:bg-white/20"
        >
          <Navigation className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Add pin button - positioned above bottom nav */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Button
          data-testid="add-pin-map-btn"
          onClick={() => setIsAddingPin(!isAddingPin)}
          className={`w-14 h-14 rounded-full ${
            isAddingPin
              ? 'bg-[#FF4500] neon-glow-orange'
              : 'glass-panel hover:bg-white/20'
          }`}
        >
          {isAddingPin ? (
            <Crosshair className="w-6 h-6 text-white" />
          ) : (
            <MapPin className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* Pin mode indicator */}
      {isAddingPin && (
        <div className="absolute top-4 left-4 z-[1000] glass-panel rounded-lg px-4 py-2">
          <span className="text-[#FF4500] font-bold text-sm">TAP MAP TO ADD PIN</span>
        </div>
      )}

      {/* Save pin dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[2000]">
          <div className="glass-panel w-full max-w-md rounded-t-3xl p-6 slide-up">
            <h3 className="font-heading text-xl font-bold text-white mb-4">Save Pin</h3>
            
            <div className="glass-panel rounded-xl p-4 mb-4">
              <div className="text-center font-mono text-sm text-[#00FF41]">
                {pendingPin?.latitude.toFixed(6)}, {pendingPin?.longitude.toFixed(6)}
              </div>
            </div>

            <input
              type="text"
              data-testid="map-pin-name-input"
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
              placeholder="Enter pin name..."
              className="w-full h-14 px-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF4500] font-medium"
              autoFocus
            />

            <div className="flex gap-3 mt-4">
              <Button
                data-testid="cancel-map-pin-btn"
                onClick={() => {
                  setShowSaveDialog(false);
                  setPendingPin(null);
                  setPinName('');
                }}
                className="flex-1 h-14 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                data-testid="confirm-map-pin-btn"
                onClick={handleSavePin}
                disabled={!pinName.trim()}
                className="flex-1 h-14 bg-[#FF4500] hover:bg-[#FF5722] text-white rounded-xl font-bold"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
