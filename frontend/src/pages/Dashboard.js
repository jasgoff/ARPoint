import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Compass, Map, List, Settings, LogOut, User, Download, Menu, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import LocationSearch from '@/components/LocationSearch';
import ExportMenu from '@/components/ExportMenu';
import OptionalAuthPrompt from '@/components/OptionalAuthPrompt';
import EmergentBranding from '@/components/EmergentBranding';
import ImportKMLMenu from '@/components/ImportKMLMenu';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { setPosition, setHeading, setAltitude, setAccuracy, setOrientation, settings } = useApp();
  const [activeTab, setActiveTab] = useState('ar');
  const [gpsStatus, setGpsStatus] = useState('searching');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Live ref to auto-correction toggle so the orientation handler always reads
  // the current setting without needing to re-bind listeners.
  const autoCorrectRef = useRef(settings.autoCompassCorrection !== false);
  useEffect(() => {
    autoCorrectRef.current = settings.autoCompassCorrection !== false;
  }, [settings.autoCompassCorrection]);

  // Optional auth check - no longer required
  // Users can use the app without authentication
  // They'll see a prompt to sign in for sync features

  // GPS and device orientation setup
  useEffect(() => {
    let watchId = null;
    let absHandler = null;
    let relHandler = null;
    let hasAbsolute = false; // true once we receive an absolute (true compass) reading
    let lastGpsHeading = null; // GPS-derived heading (true north when moving)

    // Read current screen rotation angle (0, 90, 180, 270)
    const getScreenAngle = () => {
      if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number') {
        return window.screen.orientation.angle;
      }
      if (typeof window.orientation === 'number') {
        return ((window.orientation % 360) + 360) % 360;
      }
      return 0;
    };

    // Remap device-frame beta/gamma to physical-world tilt based on screen rotation.
    // - "betaOut" = forward/back tilt (positive = top of device tilts toward user)
    // - "gammaOut" = side-to-side tilt (positive = right side of device tilts down)
    const remapTilt = (beta, gamma, screenAngle) => {
      switch (screenAngle) {
        case 90:  // landscape-left (home button on right, on most Android)
          return { beta: -gamma, gamma: beta };
        case 180: // portrait upside down
          return { beta: -beta, gamma: -gamma };
        case 270: // landscape-right
          return { beta: gamma, gamma: -beta };
        case 0:
        default:  // portrait
          return { beta, gamma };
      }
    };

    // Resolve the most accurate compass heading available from an event.
    // Returns null if no absolute heading can be derived from this event.
    const resolveHeading = (event) => {
      // iOS Safari: webkitCompassHeading is degrees clockwise from true north
      if (typeof event.webkitCompassHeading === 'number' && !Number.isNaN(event.webkitCompassHeading)) {
        return event.webkitCompassHeading;
      }
      // Android Chrome / spec-compliant: deviceorientationabsolute or absolute===true
      // alpha is degrees counter-clockwise from north -> convert
      if (event.absolute === true && typeof event.alpha === 'number') {
        return (360 - event.alpha) % 360;
      }
      return null;
    };

    // Combine device compass with screen rotation so heading reflects where the
    // top of the *device chassis* (back-camera up axis) is pointing.
    const applyScreenOffset = (compassDeg, screenAngle) => {
      return ((compassDeg + screenAngle) % 360 + 360) % 360;
    };

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setAltitude(pos.coords.altitude || 0);
          setAccuracy(pos.coords.accuracy);
          // Use GPS heading only when device sensor compass is unavailable
          if (pos.coords.heading !== null && !Number.isNaN(pos.coords.heading)) {
            lastGpsHeading = pos.coords.heading;
            if (!hasAbsolute) setHeading(pos.coords.heading);
          }
          setGpsStatus('active');
        },
        (error) => {
          console.error('GPS error:', error);
          setGpsStatus('error');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000
        }
      );
    }

    if (window.DeviceOrientationEvent) {
      const buildHandler = (preferAbsolute) => (event) => {
        const autoCorrect = autoCorrectRef.current;
        const screenAngle = autoCorrect ? getScreenAngle() : 0;
        const remapped = autoCorrect
          ? remapTilt(event.beta || 0, event.gamma || 0, screenAngle)
          : { beta: event.beta || 0, gamma: event.gamma || 0 };

        setOrientation({
          alpha: event.alpha || 0,
          beta: remapped.beta,
          gamma: remapped.gamma
        });

        const absHeading = resolveHeading(event);
        if (absHeading !== null) {
          hasAbsolute = true;
          setHeading(applyScreenOffset(absHeading, screenAngle));
        } else if (!hasAbsolute && preferAbsolute === false && typeof event.alpha === 'number') {
          // Relative-only fallback (e.g., desktop / older Android). NOT true north,
          // but better than nothing. Convert to clockwise-from-zero.
          const relative = (360 - event.alpha) % 360;
          setHeading(applyScreenOffset(relative, screenAngle));
        }
      };

      absHandler = buildHandler(true);
      relHandler = buildHandler(false);

      const attachListeners = () => {
        // Prefer the absolute event; many Android Chrome builds only emit on this one.
        window.addEventListener('deviceorientationabsolute', absHandler, true);
        window.addEventListener('deviceorientation', relHandler, true);
      };

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') attachListeners();
          })
          .catch(console.error);
      } else {
        attachListeners();
      }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (absHandler) window.removeEventListener('deviceorientationabsolute', absHandler, true);
      if (relHandler) window.removeEventListener('deviceorientation', relHandler, true);
    };
  }, [setPosition, setHeading, setAltitude, setAccuracy, setOrientation]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    navigate(`/dashboard/${tab}`);
  }, [navigate]);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (['ar', 'map', 'saved', 'settings'].includes(path)) {
      setActiveTab(path);
    } else if (location.pathname === '/dashboard') {
      navigate('/dashboard/ar', { replace: true });
    }
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <Loader2 className="w-12 h-12 text-[#FF4500] spinner" />
      </div>
    );
  }

  const displayUser = user || location.state?.user;

  return (
    <div className="app-container" data-testid="dashboard-container">
      {/* Optional Auth Prompt - shows if not authenticated */}
      <OptionalAuthPrompt />
      
      {/* Header */}
      <header className="glass-panel px-4 py-3 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF4500] to-[#FF6B35] flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-white tracking-tight hidden sm:inline">AR Survey</span>
        </div>

        {/* Center - Location Search */}
        <div className="flex-1 flex justify-center px-4">
          <LocationSearch />
        </div>

        <div className="flex items-center gap-2">
          {/* GPS Status */}
          <div className="flex items-center gap-2 mr-2">
            <div className={`w-2 h-2 rounded-full ${
              gpsStatus === 'active' ? 'bg-[#00FF41]' :
              gpsStatus === 'searching' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-white/60 font-mono uppercase hidden sm:inline">
              {gpsStatus === 'active' ? 'GPS' : gpsStatus === 'searching' ? 'GPS...' : 'No GPS'}
            </span>
          </div>

          {/* Export button */}
          <button
            data-testid="export-menu-btn"
            onClick={() => setShowExportMenu(true)}
            className="p-2 text-white/60 hover:text-[#00FF41] transition-colors"
            title="Export KML"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Import button */}
          <button
            data-testid="import-menu-btn"
            onClick={() => setShowImportMenu(true)}
            className="p-2 text-white/60 hover:text-[#007AFF] transition-colors"
            title="Import KML"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>

          {/* Mobile menu toggle */}
          <button
            className="p-2 text-white/60 hover:text-white sm:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* User menu (desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {displayUser?.picture ? (
                  <img
                    src={displayUser.picture}
                    alt={displayUser.name}
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#FF4500] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <button
                  data-testid="logout-btn"
                  onClick={logout}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                data-testid="header-login-btn"
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 text-sm font-semibold text-white/80 hover:text-white border border-white/20 hover:bg-white/10 rounded-lg transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-xl p-2 z-50">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 p-3 border-b border-white/10">
                  {displayUser?.picture ? (
                    <img
                      src={displayUser.picture}
                      alt={displayUser.name}
                      className="w-10 h-10 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FF4500] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{displayUser?.name}</div>
                    <div className="text-white/50 text-xs truncate">{displayUser?.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowExportMenu(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full p-3 flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <Download className="w-5 h-5" />
                  Export KML
                </button>
                <button
                  onClick={() => {
                    setShowImportMenu(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full p-3 flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import KML
                </button>
                <button
                  onClick={logout}
                  className="w-full p-3 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setShowMobileMenu(false);
                }}
                className="w-full p-3 flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <User className="w-5 h-5" />
                Sign in with Google
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom navigation - UNIFORM */}
      <nav className="bottom-nav" data-testid="bottom-navigation">
        <button
          data-testid="nav-ar"
          className={`nav-item ${activeTab === 'ar' ? 'active' : ''}`}
          onClick={() => handleTabChange('ar')}
        >
          <Compass className="w-6 h-6" />
          <span>AR</span>
        </button>
        <button
          data-testid="nav-map"
          className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => handleTabChange('map')}
        >
          <Map className="w-6 h-6" />
          <span>Map</span>
        </button>
        <button
          data-testid="nav-saved"
          className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => handleTabChange('saved')}
        >
          <List className="w-6 h-6" />
          <span>Saved</span>
        </button>
        <button
          data-testid="nav-settings"
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabChange('settings')}
        >
          <Settings className="w-6 h-6" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Export Menu Modal */}
      <ExportMenu 
        isOpen={showExportMenu} 
        onClose={() => setShowExportMenu(false)} 
      />

      {/* Import Menu Modal */}
      <ImportKMLMenu 
        isOpen={showImportMenu} 
        onClose={() => setShowImportMenu(false)} 
      />

      {/* Emergent Branding */}
      <EmergentBranding 
        show={settings.showEmergentBranding}
        position={settings.emergentBrandingPosition}
      />
    </div>
  );
};

export default Dashboard;
