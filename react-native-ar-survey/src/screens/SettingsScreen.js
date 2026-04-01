import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Svg, { Path, Circle } from 'react-native-svg';

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const rangeInFeet = Math.round((settings.arPinRange || 610) * 3.28084);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Profile */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
            <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" />
          </Svg>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
        </View>
      </View>

      {/* AR View Settings */}
      <Text style={styles.sectionTitle}>AR View</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke="#00FF41" strokeWidth="2" />
              <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="#00FF41" />
            </Svg>
            <View>
              <Text style={styles.settingLabel}>Show Compass</Text>
              <Text style={styles.settingDescription}>Display 3D compass in AR view</Text>
            </View>
          </View>
          <Switch
            value={settings.showCompass}
            onValueChange={(value) => updateSettings({ showCompass: value })}
            trackColor={{ false: '#333', true: '#00FF41' }}
            thumbColor="white"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#FF4500" strokeWidth="2" />
              <Circle cx="12" cy="10" r="3" stroke="#FF4500" strokeWidth="2" />
            </Svg>
            <View>
              <Text style={styles.settingLabel}>Show AR Pins</Text>
              <Text style={styles.settingDescription}>Display nearby pins in camera view</Text>
            </View>
          </View>
          <Switch
            value={settings.showARPins}
            onValueChange={(value) => updateSettings({ showARPins: value })}
            trackColor={{ false: '#333', true: '#FF4500' }}
            thumbColor="white"
          />
        </View>

        {settings.showARPins && (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L19 21l-7-4-7 4 7-19z" fill="#007AFF" />
              </Svg>
              <View>
                <Text style={styles.settingLabel}>AR Pin Range</Text>
                <Text style={styles.settingDescription}>
                  Show pins within {rangeInFeet} ft ({settings.arPinRange || 610} m)
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Units Settings */}
      <Text style={styles.sectionTitle}>Measurement Units</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M4 20h16M4 20v-4M20 20v-4M4 16h16M8 4v12M16 4v12M8 4h8" stroke="#007AFF" strokeWidth="2" />
            </Svg>
            <View>
              <Text style={styles.settingLabel}>Distance Units</Text>
              <Text style={styles.settingDescription}>
                {settings.units === 'metric' ? 'Meters / Kilometers' : 'Feet / Miles'}
              </Text>
            </View>
          </View>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, settings.units === 'metric' && styles.toggleBtnActive]}
              onPress={() => updateSettings({ units: 'metric' })}
            >
              <Text style={[styles.toggleBtnText, settings.units === 'metric' && styles.toggleBtnTextActive]}>
                Metric
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, settings.units === 'imperial' && styles.toggleBtnActive]}
              onPress={() => updateSettings({ units: 'imperial' })}
            >
              <Text style={[styles.toggleBtnText, settings.units === 'imperial' && styles.toggleBtnTextActive]}>
                Imperial
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Display Settings */}
      <Text style={styles.sectionTitle}>Display Options</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke="#FF4500" strokeWidth="2" />
              <Path d="M12 6v6l4 2" stroke="#FF4500" strokeWidth="2" />
            </Svg>
            <View>
              <Text style={styles.settingLabel}>Show Coordinates</Text>
              <Text style={styles.settingDescription}>Display GPS coordinates in AR view</Text>
            </View>
          </View>
          <Switch
            value={settings.showCoordinates}
            onValueChange={(value) => updateSettings({ showCoordinates: value })}
            trackColor={{ false: '#333', true: '#FF4500' }}
            thumbColor="white"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2v20M2 12h20" stroke="#007AFF" strokeWidth="2" />
            </Svg>
            <View>
              <Text style={styles.settingLabel}>Show Altitude</Text>
              <Text style={styles.settingDescription}>Display altitude readings</Text>
            </View>
          </View>
          <Switch
            value={settings.showAltitude}
            onValueChange={(value) => updateSettings({ showAltitude: value })}
            trackColor={{ false: '#333', true: '#007AFF' }}
            thumbColor="white"
          />
        </View>
      </View>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Rect x="5" y="2" width="14" height="20" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
              <Path d="M12 18h.01" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            </Svg>
            <View>
              <Text style={styles.settingLabel}>AR Survey Mobile</Text>
              <Text style={styles.settingDescription}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#FF4444" strokeWidth="2" />
        </Svg>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: '#141414',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toggleBtnActive: {
    backgroundColor: '#007AFF',
  },
  toggleBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: 'white',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,68,68,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
  },
  logoutBtnText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
