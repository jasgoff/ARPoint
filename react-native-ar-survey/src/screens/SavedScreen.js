import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

export default function SavedScreen() {
  const {
    getPins,
    deletePin,
    getTraces,
    deleteTrace,
    getMeasurements,
    deleteMeasurement,
    formatDistance,
    formatBearing,
  } = useApp();

  const [activeTab, setActiveTab] = useState('pins');
  const [pins, setPins] = useState([]);
  const [traces, setTraces] = useState([]);
  const [measurements, setMeasurements] = useState([]);

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

  const handleDeletePin = (id, name) => {
    Alert.alert('Delete Pin', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePin(id);
          setPins(prev => prev.filter(p => p.id !== id));
        },
      },
    ]);
  };

  const handleDeleteTrace = (id, name) => {
    Alert.alert('Delete Trace', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrace(id);
          setTraces(prev => prev.filter(t => t.id !== id));
        },
      },
    ]);
  };

  const handleDeleteMeasurement = (id, name) => {
    Alert.alert('Delete Measurement', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMeasurement(id);
          setMeasurements(prev => prev.filter(m => m.id !== id));
        },
      },
    ]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const EmptyState = ({ icon, title, description }) => (
    <View style={styles.emptyState}>
      {icon}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );

  const renderPins = () => {
    if (pins.length === 0) {
      return (
        <EmptyState
          icon={
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
              <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <Circle cx="12" cy="10" r="3" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            </Svg>
          }
          title="No Pins Saved"
          description="Drop pins in AR view or tap on the map to save locations"
        />
      );
    }

    return pins.map((pin) => (
      <View key={pin.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#FF4500" strokeWidth="2" />
              <Circle cx="12" cy="10" r="3" stroke="#FF4500" strokeWidth="2" />
            </Svg>
          </View>
          <Text style={styles.itemName}>{pin.name}</Text>
          <TouchableOpacity onPress={() => handleDeletePin(pin.id, pin.name)}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            </Svg>
          </TouchableOpacity>
        </View>
        <Text style={styles.coordsText}>
          {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
        </Text>
        {pin.altitude > 0 && (
          <Text style={styles.metaText}>Altitude: {pin.altitude.toFixed(1)}m</Text>
        )}
        <Text style={styles.dateText}>{formatDate(pin.created_at)}</Text>
      </View>
    ));
  };

  const renderTraces = () => {
    if (traces.length === 0) {
      return (
        <EmptyState
          icon={
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
              <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <Path d="M22 4L12 14.01l-3-3" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            </Svg>
          }
          title="No Traces Saved"
          description="Start tracing in AR view to record your path"
        />
      );
    }

    return traces.map((trace) => (
      <View key={trace.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={[styles.itemIcon, { backgroundColor: 'rgba(0,255,65,0.1)' }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#00FF41" strokeWidth="2" />
              <Path d="M22 4L12 14.01l-3-3" stroke="#00FF41" strokeWidth="2" />
            </Svg>
          </View>
          <Text style={styles.itemName}>{trace.name}</Text>
          <TouchableOpacity onPress={() => handleDeleteTrace(trace.id, trace.name)}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            </Svg>
          </TouchableOpacity>
        </View>
        <Text style={[styles.distanceText, { color: '#00FF41' }]}>
          {formatDistance(trace.total_distance)}
        </Text>
        <Text style={styles.metaText}>{trace.points?.length || 0} waypoints</Text>
        <Text style={styles.dateText}>{formatDate(trace.created_at)}</Text>
      </View>
    ));
  };

  const renderMeasurements = () => {
    if (measurements.length === 0) {
      return (
        <EmptyState
          icon={
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
              <Line x1="4" y1="20" x2="20" y2="4" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <Rect x="2" y="18" width="4" height="4" fill="rgba(255,255,255,0.2)" />
              <Rect x="18" y="2" width="4" height="4" fill="rgba(255,255,255,0.2)" />
            </Svg>
          }
          title="No Measurements Saved"
          description="Use the measure tool in AR view to save distances"
        />
      );
    }

    return measurements.map((m) => (
      <View key={m.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={[styles.itemIcon, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Line x1="4" y1="20" x2="20" y2="4" stroke="#007AFF" strokeWidth="2" />
              <Circle cx="4" cy="20" r="2" fill="#007AFF" />
              <Circle cx="20" cy="4" r="2" fill="#007AFF" />
            </Svg>
          </View>
          <Text style={styles.itemName}>{m.name}</Text>
          <TouchableOpacity onPress={() => handleDeleteMeasurement(m.id, m.name)}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            </Svg>
          </TouchableOpacity>
        </View>
        <Text style={[styles.distanceText, { color: '#007AFF' }]}>
          {formatDistance(m.distance)}
        </Text>
        <Text style={styles.metaText}>{formatBearing(m.bearing)}</Text>
        <Text style={styles.dateText}>{formatDate(m.created_at)}</Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pins' && styles.tabActive]}
          onPress={() => setActiveTab('pins')}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={activeTab === 'pins' ? '#FF4500' : 'rgba(255,255,255,0.5)'} strokeWidth="2" />
          </Svg>
          <Text style={[styles.tabText, activeTab === 'pins' && styles.tabTextActive]}>
            Pins ({pins.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'traces' && styles.tabActiveGreen]}
          onPress={() => setActiveTab('traces')}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke={activeTab === 'traces' ? '#00FF41' : 'rgba(255,255,255,0.5)'} strokeWidth="2" />
          </Svg>
          <Text style={[styles.tabText, activeTab === 'traces' && styles.tabTextActiveGreen]}>
            Traces ({traces.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'measurements' && styles.tabActiveBlue]}
          onPress={() => setActiveTab('measurements')}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Line x1="4" y1="20" x2="20" y2="4" stroke={activeTab === 'measurements' ? '#007AFF' : 'rgba(255,255,255,0.5)'} strokeWidth="2" />
          </Svg>
          <Text style={[styles.tabText, activeTab === 'measurements' && styles.tabTextActiveBlue]}>
            ({measurements.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'pins' && renderPins()}
        {activeTab === 'traces' && renderTraces()}
        {activeTab === 'measurements' && renderMeasurements()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(255,69,0,0.15)',
    borderColor: 'rgba(255,69,0,0.5)',
  },
  tabActiveGreen: {
    backgroundColor: 'rgba(0,255,65,0.1)',
    borderColor: 'rgba(0,255,65,0.5)',
  },
  tabActiveBlue: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: 'rgba(0,122,255,0.5)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF4500',
  },
  tabTextActiveGreen: {
    color: '#00FF41',
  },
  tabTextActiveBlue: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyDescription: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,69,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  coordsText: {
    color: '#00FF41',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 4,
  },
  dateText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
  },
});
