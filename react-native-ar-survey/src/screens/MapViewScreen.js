import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function MapViewScreen() {
  const {
    position,
    getPins,
    addPin,
    deletePin,
    getTraces,
    getMeasurements,
    formatDistance,
    formatBearing,
    settings,
  } = useApp();

  const [pins, setPins] = useState([]);
  const [traces, setTraces] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [mapType, setMapType] = useState(settings.mapType === 'satellite' ? 'satellite' : 'standard');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [pinName, setPinName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [region, setRegion] = useState({
    latitude: position?.latitude || 37.7749,
    longitude: position?.longitude || -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pinsData, tracesData, measurementsData] = await Promise.all([
      getPins(),
      getTraces(),
      getMeasurements(),
    ]);
    setPins(pinsData);
    setTraces(tracesData);
    setMeasurements(measurementsData);
  };

  // Update region when position changes
  useEffect(() => {
    if (position) {
      setRegion(prev => ({
        ...prev,
        latitude: position.latitude,
        longitude: position.longitude,
      }));
    }
  }, [position]);

  const handleMapPress = (event) => {
    if (isAddingPin) {
      const { coordinate } = event.nativeEvent;
      setPendingPin(coordinate);
      setPinName('');
      setShowSaveDialog(true);
    }
  };

  const handleSavePin = async () => {
    if (!pendingPin || !pinName.trim()) return;

    const newPin = await addPin({
      name: pinName.trim(),
      latitude: pendingPin.latitude,
      longitude: pendingPin.longitude,
      altitude: 0,
    });

    setPins(prev => [...prev, newPin]);
    setPendingPin(null);
    setPinName('');
    setShowSaveDialog(false);
    setIsAddingPin(false);
  };

  const handleDeletePin = async (pinId) => {
    await deletePin(pinId);
    setPins(prev => prev.filter(p => p.id !== pinId));
  };

  const centerOnPosition = () => {
    if (position) {
      setRegion({
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Saved pins */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.name}
            description={`${pin.latitude.toFixed(6)}, ${pin.longitude.toFixed(6)}`}
            pinColor="#FF4500"
          />
        ))}

        {/* Traces */}
        {traces.map((trace) => (
          <Polyline
            key={trace.id}
            coordinates={trace.points.map(p => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            strokeColor="#00FF41"
            strokeWidth={4}
          />
        ))}

        {/* Measurements */}
        {measurements.map((m) => (
          <React.Fragment key={m.id}>
            <Polyline
              coordinates={[
                { latitude: m.start_point.latitude, longitude: m.start_point.longitude },
                { latitude: m.end_point.latitude, longitude: m.end_point.longitude },
              ]}
              strokeColor="#007AFF"
              strokeWidth={3}
              lineDashPattern={[10, 10]}
            />
            <Marker
              coordinate={{ latitude: m.start_point.latitude, longitude: m.start_point.longitude }}
              pinColor="#007AFF"
            />
            <Marker
              coordinate={{ latitude: m.end_point.latitude, longitude: m.end_point.longitude }}
              pinColor="#007AFF"
            />
          </React.Fragment>
        ))}

        {/* Pending pin */}
        {pendingPin && (
          <Marker
            coordinate={pendingPin}
            pinColor="#FFD700"
          />
        )}
      </MapView>

      {/* Map controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setMapType(mapType === 'satellite' ? 'standard' : 'satellite')}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={centerOnPosition}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L19 21l-7-4-7 4 7-19z" fill="white" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Add pin button */}
      <TouchableOpacity
        style={[styles.addPinBtn, isAddingPin && styles.addPinBtnActive]}
        onPress={() => setIsAddingPin(!isAddingPin)}
      >
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="white" strokeWidth="2" />
          <Circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2" />
        </Svg>
      </TouchableOpacity>

      {/* Add pin mode indicator */}
      {isAddingPin && (
        <View style={styles.modeIndicator}>
          <Text style={styles.modeText}>TAP MAP TO ADD PIN</Text>
        </View>
      )}

      {/* Save pin dialog */}
      <Modal visible={showSaveDialog} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Pin</Text>

            <View style={styles.coordsPreview}>
              <Text style={styles.coordsText}>
                {pendingPin?.latitude.toFixed(6)}, {pendingPin?.longitude.toFixed(6)}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              value={pinName}
              onChangeText={setPinName}
              placeholder="Enter pin name..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowSaveDialog(false);
                  setPendingPin(null);
                  setPinName('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !pinName.trim() && styles.saveBtnDisabled]}
                onPress={handleSavePin}
                disabled={!pinName.trim()}
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
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 60,
    right: 16,
    gap: 8,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addPinBtn: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addPinBtnActive: {
    backgroundColor: '#FF4500',
    borderColor: '#FF4500',
  },
  modeIndicator: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,69,0,0.5)',
  },
  modeText: {
    color: '#FF4500',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
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
  coordsPreview: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  coordsText: {
    color: '#00FF41',
    fontSize: 14,
    fontFamily: 'monospace',
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
