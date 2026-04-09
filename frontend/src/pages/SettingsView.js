import React from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Ruler,
  Compass,
  MapPin,
  Map,
  User,
  LogOut,
  LogIn,
  Info,
  Smartphone,
  Eye,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const SettingsView = () => {
  const { settings, updateSettings } = useApp();
  const { user, logout, login, isAuthenticated } = useAuth();

  // Convert meters to feet for display
  const rangeInFeet = Math.round((settings.arPinRange || 610) * 3.28084);

  return (
    <div className="settings-panel" data-testid="settings-view">
      {/* User Profile */}
      <div className="saved-item mb-6">
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-14 h-14 rounded-full border-2 border-white/20"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#FF4500] flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{user?.name || 'User'}</h3>
            <p className="text-white/50 text-sm">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* AR View Settings */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-1">
          AR View
        </h4>
        
        <div className="settings-item">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-[#00FF41]" />
            <div>
              <Label className="text-white font-medium">Show Compass</Label>
              <p className="text-xs text-white/40 mt-0.5">Display 3D compass in AR view</p>
            </div>
          </div>
          <Switch
            data-testid="toggle-compass"
            checked={settings.showCompass}
            onCheckedChange={(checked) => updateSettings({ showCompass: checked })}
          />
        </div>

        <div className="settings-item">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#FF4500]" />
            <div>
              <Label className="text-white font-medium">Show AR Pins</Label>
              <p className="text-xs text-white/40 mt-0.5">Display nearby pins in camera view</p>
            </div>
          </div>
          <Switch
            data-testid="toggle-ar-pins"
            checked={settings.showARPins}
            onCheckedChange={(checked) => updateSettings({ showARPins: checked })}
          />
        </div>

        {settings.showARPins && (
          <div className="settings-item flex-col items-start">
            <div className="flex items-center gap-3 w-full mb-3">
              <Navigation className="w-5 h-5 text-[#007AFF]" />
              <div className="flex-1">
                <Label className="text-white font-medium">AR Pin Range</Label>
                <p className="text-xs text-white/40 mt-0.5">
                  Show pins within {rangeInFeet} ft ({settings.arPinRange || 610} m)
                </p>
              </div>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={settings.arPinRange || 610}
              onChange={(e) => updateSettings({ arPinRange: Number(e.target.value) })}
              className="w-full accent-[#007AFF]"
            />
            <div className="flex justify-between w-full text-xs text-white/40 mt-1">
              <span>330 ft</span>
              <span>6,560 ft</span>
            </div>
          </div>
        )}

        {/* Compass Calibration */}
        {settings.showCompass && (
          <div className="settings-item flex-col items-start">
            <div className="flex items-center gap-3 w-full mb-3">
              <Compass className="w-5 h-5 text-[#FF4500]" />
              <div className="flex-1">
                <Label className="text-white font-medium">Compass Calibration</Label>
                <p className="text-xs text-white/40 mt-0.5">
                  Adjust compass orientation: {settings.compassCalibration || -90}° offset
                </p>
              </div>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="15"
              value={settings.compassCalibration || -90}
              onChange={(e) => updateSettings({ compassCalibration: Number(e.target.value) })}
              className="w-full accent-[#FF4500]"
            />
            <div className="flex justify-between w-full text-xs text-white/40 mt-1">
              <span>-180°</span>
              <span>0°</span>
              <span>+180°</span>
            </div>
            <div className="mt-2 p-2 bg-[#FF4500]/10 rounded-lg w-full">
              <p className="text-xs text-white/60">
                💡 <strong>Landscape mode:</strong> -90° (default)<br/>
                💡 <strong>Portrait mode:</strong> 0°<br/>
                💡 Adjust if compass doesn't align with device direction
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Units Settings */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-1">
          Measurement Units
        </h4>
        <div className="settings-item">
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-[#007AFF]" />
            <div>
              <Label className="text-white font-medium">Distance Units</Label>
              <p className="text-xs text-white/40 mt-0.5">
                {settings.units === 'metric' ? 'Meters / Kilometers' : 'Feet / Miles'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="units-metric-btn"
              onClick={() => updateSettings({ units: 'metric' })}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                settings.units === 'metric'
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Metric
            </Button>
            <Button
              data-testid="units-imperial-btn"
              onClick={() => updateSettings({ units: 'imperial' })}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                settings.units === 'imperial'
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Imperial
            </Button>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-1">
          Display Options
        </h4>
        
        <div className="settings-item">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-[#FF4500]" />
            <div>
              <Label className="text-white font-medium">Show Coordinates</Label>
              <p className="text-xs text-white/40 mt-0.5">Display GPS coordinates in AR view</p>
            </div>
          </div>
          <Switch
            data-testid="toggle-coordinates"
            checked={settings.showCoordinates}
            onCheckedChange={(checked) => updateSettings({ showCoordinates: checked })}
          />
        </div>

        <div className="settings-item">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-[#007AFF]" />
            <div>
              <Label className="text-white font-medium">Show Altitude</Label>
              <p className="text-xs text-white/40 mt-0.5">Display altitude readings</p>
            </div>
          </div>
          <Switch
            data-testid="toggle-altitude"
            checked={settings.showAltitude}
            onCheckedChange={(checked) => updateSettings({ showAltitude: checked })}
          />
        </div>
      </div>

      {/* Map Settings */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-1">
          Map Settings
        </h4>
        <div className="settings-item">
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-[#FF4500]" />
            <div>
              <Label className="text-white font-medium">Default Map Type</Label>
              <p className="text-xs text-white/40 mt-0.5">
                {settings.mapType === 'satellite' ? 'Satellite imagery' : 'Street map'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="map-satellite-btn"
              onClick={() => updateSettings({ mapType: 'satellite' })}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                settings.mapType === 'satellite'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Satellite
            </Button>
            <Button
              data-testid="map-street-btn"
              onClick={() => updateSettings({ mapType: 'street' })}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                settings.mapType === 'street'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Street
            </Button>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-1">
          Account
        </h4>
        
        {isAuthenticated ? (
          <Button
            data-testid="settings-logout-btn"
            onClick={logout}
            className="w-full h-14 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        ) : (
          <Button
            data-testid="settings-login-btn"
            onClick={login}
            className="w-full h-14 bg-white text-[#0A0A0A] hover:bg-white/90 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </Button>
        )}
      </div>

      {/* About */}
      <div className="mb-20">
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-1">
          About
        </h4>
        <div className="settings-item">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-white/60" />
            <div>
              <Label className="text-white font-medium">AR Survey PWA</Label>
              <p className="text-xs text-white/40 mt-0.5">Version 1.1.0</p>
            </div>
          </div>
        </div>
        <div className="settings-item">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-white/60" />
            <div>
              <Label className="text-white font-medium">Data Storage</Label>
              <p className="text-xs text-white/40 mt-0.5">
                {isAuthenticated ? 'Synced with Google account' : 'Stored locally on your device'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
