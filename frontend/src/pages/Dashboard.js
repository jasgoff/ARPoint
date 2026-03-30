import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Compass, Map, List, Settings, LogOut, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout, checkAuth } = useAuth();
  const { setPosition, setHeading, setAltitude, setAccuracy, setOrientation } = useApp();
  const [activeTab, setActiveTab] = useState('ar');
  const [gpsStatus, setGpsStatus] = useState('searching'); // 'searching', 'active', 'error'

  // Auth check
  useEffect(() => {
    if (location.state?.user) {
      return; // Skip if user data passed from AuthCallback
    }
    if (!loading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, navigate, location.state]);

  // GPS and device orientation setup
  useEffect(() => {
    let watchId = null;
    let orientationHandler = null;

    // Start GPS tracking
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

    // Device orientation
    if (window.DeviceOrientationEvent) {
      orientationHandler = (event) => {
        setOrientation({
          alpha: event.alpha || 0, // Compass heading (0-360)
          beta: event.beta || 0,   // Front-back tilt (-180 to 180)
          gamma: event.gamma || 0  // Left-right tilt (-90 to 90)
        });
        // Use alpha for heading if available
        if (event.alpha !== null && event.webkitCompassHeading === undefined) {
          setHeading(event.alpha);
        } else if (event.webkitCompassHeading !== undefined) {
          // iOS
          setHeading(event.webkitCompassHeading);
        }
      };

      // Request permission on iOS 13+
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

  // Determine active tab from URL
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
      <header className="glass-panel px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF4500] to-[#FF6B35] flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-white tracking-tight">AR Survey</span>
        </div>
        <div className="flex items-center gap-3">
          {/* GPS Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              gpsStatus === 'active' ? 'bg-[#00FF41]' :
              gpsStatus === 'searching' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-white/60 font-mono uppercase">
              {gpsStatus === 'active' ? 'GPS' : gpsStatus === 'searching' ? 'GPS...' : 'No GPS'}
            </span>
          </div>
          {/* User menu */}
          <div className="flex items-center gap-2">
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
    </div>
  );
};

export default Dashboard;
