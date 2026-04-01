import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Compass, Map, List, Settings, LogOut, User, Download, Menu, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import LocationSearch from '@/components/LocationSearch';
import ExportMenu from '@/components/ExportMenu';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { setPosition, setHeading, setAltitude, setAccuracy, setOrientation } = useApp();
  const [activeTab, setActiveTab] = useState('ar');
  const [gpsStatus, setGpsStatus] = useState('searching');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Auth check
  useEffect(() => {
    if (location.state?.user) {
      return;
    }
    if (!loading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, navigate, location.state]);

  // GPS and device orientation setup
  useEffect(() => {
    let watchId = null;
    let orientationHandler = null;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setAltitude(pos.coords.altitude || 0);
          setAccuracy(pos.coords.accuracy);
          if (pos.coords.heading !== null) {
            setHeading(pos.coords.heading);
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
      orientationHandler = (event) => {
        setOrientation({
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        });
        if (event.alpha !== null && event.webkitCompassHeading === undefined) {
          setHeading(event.alpha);
        } else if (event.webkitCompassHeading !== undefined) {
          setHeading(event.webkitCompassHeading);
        }
      };

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', orientationHandler);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', orientationHandler);
      }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler);
      }
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

          {/* Mobile menu toggle */}
          <button
            className="p-2 text-white/60 hover:text-white sm:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* User menu (desktop) */}
          <div className="hidden sm:flex items-center gap-2">
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
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-xl p-2 z-50">
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
              onClick={logout}
              className="w-full p-3 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        <button
          data-testid="nav-ar"
          className={`nav-item ${activeTab === 'ar' ? 'active' : ''}`}
          onClick={() => handleTabChange('ar')}
        >
          <Compass className="w-6 h-6" />
          <span>AR View</span>
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
    </div>
  );
};

export default Dashboard;
