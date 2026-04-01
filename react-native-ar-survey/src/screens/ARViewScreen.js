import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as Location from 'expo-location';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import { useApp } from '../context/AppContext';
import Compass3D from '../components/Compass3D';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function ARViewScreen() {
  const {
    position, setPosition,
    heading, setHeading,
    altitude, setAltitude,
    accuracy, setAccuracy,
    orientation, setOrientation,
    mode, setMode,
    measureStart, setMeasureStart,
    measureEnd, setMeasureEnd,
    addPin, addMeasurement,
    calculateDistance, calculateBearing,
    formatDistance, formatBearing,
    settings,
  } = useApp();

  const [hasPermission, setHasPermission] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [currentDistance, setCurrentDistance] = useState(null);
  const [currentBearing, setCurrentBearing] = useState(null);
  const locationSubscription = useRef(null);
  const magnetometerSubscription = useRef(null);

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && locationStatus === 'granted');

      if (locationStatus === 'granted') {
        // Start location tracking
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setPosition({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            setAltitude(location.coords.altitude || 0);
            setAccuracy(location.coords.accuracy);
            if (location.coords.heading !== null) {
              setHeading(location.coords.heading);
            }
          }
        );
      }

      // Start magnetometer for compass
      Magnetometer.setUpdateInterval(100);
      magnetometerSubscription.current = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setHeading(angle);
      });

      // Accelerometer for orientation
      Accelerometer.setUpdateInterval(100);
      Accelerometer.addListener((data) => {
        const beta = Math.atan2(data.y, data.z) * (180 / Math.PI);
        const gamma = Math.atan2(data.x, data.z) * (180 / Math.PI);
        setOrientation({ alpha: heading, beta, gamma });
      });
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (magnetometerSubscription.current) {
        magnetometerSubscription.current.remove();
      }
      Accelerometer.removeAllListeners();
    };
  }, []);

  // Handle pin drop
  const handlePinDrop = useCallback(() => {
    if (!position) {
      Alert.alert('Error', 'Waiting for GPS location...');
      return;
    }
    setSaveName('');
    setShowSaveDialog(true);
  }, [position]);

  const savePinDrop = useCallback(async () => {
    if (!position || !saveName.trim()) return;

    await addPin({
      name: saveName.trim(),
      latitude: position.latitude,
      longitude: position.longitude,
      altitude: altitude || 0,
      bearing: heading,
    });

    setShowSaveDialog(false);
    setSaveName('');
    setMode('view');
    Alert.alert('Success', 'Pin saved!');
  }, [position, saveName, altitude, heading, addPin, setMode]);

  // Handle measurement
  const handleMeasure = useCallback(() => {
    if (!position) {
      Alert.alert('Error', 'Waiting for GPS location...');
      return;
    }

    if (!measureStart) {
      setMeasureStart({
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: altitude || 0,
      });
    } else {
      const endPoint = {
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: altitude || 0,
      };
      setMeasureEnd(endPoint);

      const dist = calculateDistance(measureStart, endPoint);
      const bear = calculateBearing(measureStart, endPoint);
      setCurrentDistance(dist);
      setCurrentBearing(bear);

      setSaveName('');
      setShowSaveDialog(true);
    }
  }, [position, altitude, measureStart, setMeasureStart, setMeasureEnd, calculateDistance, calculateBearing]);

  const saveMeasurement = useCallback(async () => {
    if (!measureStart || !measureEnd || !saveName.trim()) return;

    await addMeasurement({
      name: saveName.trim(),
      start_point: measureStart,
      end_point: measureEnd,
      distance: currentDistance,
      bearing: currentBearing,
    });

    setMeasureStart(null);
    setMeasureEnd(null);
    setCurrentDistance(null);
    setCurrentBearing(null);
    setShowSaveDialog(false);
    setSaveName('');
    setMode('view');
    Alert.alert('Success', 'Measurement saved!');
  }, [measureStart, measureEnd, saveName, currentDistance, currentBearing, addMeasurement, setMeasureStart, setMeasureEnd, setMode]);

  const cancelAction = useCallback(() => {
    setMode('view');
    setMeasureStart(null);
    setMeasureEnd(null);
    setCurrentDistance(null);
    setCurrentBearing(null);
    setShowSaveDialog(false);
    setSaveName('');
  }, [setMode, setMeasureStart, setMeasureEnd]);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
          <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <Circle cx="12" cy="13" r="4" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        </Svg>
        <Text style={styles.permissionText}>Camera & Location Access Required</Text>
        <Text style={styles.permissionSubtext}>Please enable permissions in Settings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView style={styles.camera} facing="back">
        {/* HUD Overlay */}
        <View style={styles.hud}>
          {/* Compass */}
          {settings.showCompass && (
            <View style={styles.compassContainer}>
              <Compass3D heading={heading} orientation={orientation} />
            </View>
          )}

          {/* Coordinates */}
          {settings.showCoordinates && (
            <View style={styles.coordsPanel}>
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>LAT</Text>
                <Text style={styles.coordValue}>
                  {position ? position.latitude.toFixed(6) : '---.------'}°
                </Text>
              </View>
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>LNG</Text>
                <Text style={styles.coordValue}>
                  {position ? position.longitude.toFixed(6) : '---.------'}°
                </Text>
              </View>
              {settings.showAltitude && (
                <View style={styles.coordRow}>
                  <Text style={styles.coordLabel}>ALT</Text>
                  <Text style={styles.coordValue}>
                    {altitude ? `${altitude.toFixed(1)}m` : '---.-m'}
                  </Text>
                </View>
              )}
              {accuracy && (
                <View style={styles.coordRow}>
                  <Text style={styles.coordLabel}>ACC</Text>
                  <Text style={[styles.coordValue, { color: '#FFD700' }]}>
                    ±{accuracy.toFixed(1)}m
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Mode indicator */}
          {mode !== 'view' && (
            <View style={styles.modeIndicator}>
              <Text style={[
                styles.modeText,
                { color: mode === 'pin' ? '#FF4500' : '#007AFF' }
              ]}>
                {mode === 'pin' ? 'PIN DROP MODE' : (measureStart ? 'TAP END POINT' : 'TAP START POINT')}
              </Text>
            </View>
          )}

          {/* Crosshair */}
          {(mode === 'pin' || mode === 'measure') && (
            <View style={styles.crosshair}>
              <View style={[styles.crosshairLine, styles.crosshairH]} />
              <View style={[styles.crosshairLine, styles.crosshairV]} />
              <View style={styles.crosshairCircle} />
            </View>
          )}

          {/* Measurement result */}
          {currentDistance !== null && currentBearing !== null && (
            <View style={styles.measurementResult}>
              <Text style={styles.measurementDistance}>{formatDistance(currentDistance)}</Text>
              <Text style={styles.measurementBearing}>{formatBearing(currentBearing)}</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            {mode === 'view' ? (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FF4500' }]}
                  onPress={() => setMode('pin')}
                >
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="white" strokeWidth="2" />
                    <Circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2" />
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#007AFF' }]}
                  onPress={() => setMode('measure')}
                >
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                    <Line x1="4" y1="20" x2="20" y2="4" stroke="white" strokeWidth="2" />
                    <Circle cx="4" cy="20" r="2" fill="white" />
                    <Circle cx="20" cy="4" r="2" fill="white" />
                  </Svg>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnSmall, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  onPress={cancelAction}
                >
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" />
                    <Line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" />
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.actionBtnLarge,
                    { backgroundColor: mode === 'pin' ? '#FF4500' : '#007AFF' }
                  ]}
                  onPress={mode === 'pin' ? handlePinDrop : handleMeasure}
                >
                  {mode === 'pin' ? (
                    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="white" strokeWidth="2" />
                      <Circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2" />
                    </Svg>
                  ) : (
                    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                      <Circle cx="12" cy="12" r="3" fill="white" />
                    </Svg>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </CameraView>

      {/* Save Dialog */}
      <Modal visible={showSaveDialog} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {mode === 'pin' ? 'Save Pin' : 'Save Measurement'}
            </Text>

            {mode === 'measure' && currentDistance !== null && (
              <View style={styles.measurementPreview}>
                <Text style={styles.previewDistance}>{formatDistance(currentDistance)}</Text>
                <Text style={styles.previewBearing}>{formatBearing(currentBearing)}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              value={saveName}
              onChangeText={setSaveName}
              placeholder="Enter name..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelAction}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !saveName.trim() && styles.saveBtnDisabled]}
                onPress={mode === 'pin' ? savePinDrop : saveMeasurement}
                disabled={!saveName.trim()}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  hud: {
    flex: 1,
    position: 'relative',
  },
  compassContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
  },
  coordsPanel: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 12,
    backdropFilter: 'blur(10px)',
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coordLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    width: 32,
    fontWeight: '600',
  },
  coordValue: {
    color: '#00FF41',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  modeIndicator: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
  },
  crosshairLine: {
    position: 'absolute',
    backgroundColor: '#00FF41',
  },
  crosshairH: {
    width: '100%',
    height: 2,
    top: '50%',
    marginTop: -1,
  },
  crosshairV: {
    width: 2,
    height: '100%',
    left: '50%',
    marginLeft: -1,
  },
  crosshairCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00FF41',
  },
  measurementResult: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,255,65,0.3)',
  },
  measurementDistance: {
    color: '#00FF41',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  measurementBearing: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  actionBtnLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  permissionSubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  measurementPreview: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  previewDistance: {
    color: '#00FF41',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  previewBearing: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
