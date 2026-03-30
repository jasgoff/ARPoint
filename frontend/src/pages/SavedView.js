import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { MapPin, Route, Ruler, Trash2, ChevronRight, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SavedView = () => {
  const {
    getPins,
    deletePin,
    getTraces,
    deleteTrace,
    getMeasurements,
    deleteMeasurement,
    formatDistance,
    formatBearing
  } = useApp();

  const [pins, setPins] = useState([]);
  const [traces, setTraces] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [activeTab, setActiveTab] = useState('pins');

  // Load data
  useEffect(() => {
    setPins(getPins());
    setTraces(getTraces());
    setMeasurements(getMeasurements());
  }, [getPins, getTraces, getMeasurements]);

  const handleDeletePin = useCallback((id) => {
    deletePin(id);
    setPins(prev => prev.filter(p => p.id !== id));
  }, [deletePin]);

  const handleDeleteTrace = useCallback((id) => {
    deleteTrace(id);
    setTraces(prev => prev.filter(t => t.id !== id));
  }, [deleteTrace]);

  const handleDeleteMeasurement = useCallback((id) => {
    deleteMeasurement(id);
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, [deleteMeasurement]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="empty-state">
      <Icon className="w-16 h-16 text-white/20 mb-4" />
      <h3 className="text-lg font-bold text-white/60 mb-2">{title}</h3>
      <p className="text-sm text-white/40">{description}</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col" data-testid="saved-view">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="w-full bg-[#141414] border border-white/10 rounded-xl p-1">
            <TabsTrigger
              value="pins"
              data-testid="tab-pins"
              className="flex-1 rounded-lg data-[state=active]:bg-[#FF4500] data-[state=active]:text-white"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Pins ({pins.length})
            </TabsTrigger>
            <TabsTrigger
              value="traces"
              data-testid="tab-traces"
              className="flex-1 rounded-lg data-[state=active]:bg-[#00FF41] data-[state=active]:text-black"
            >
              <Route className="w-4 h-4 mr-2" />
              Traces ({traces.length})
            </TabsTrigger>
            <TabsTrigger
              value="measurements"
              data-testid="tab-measurements"
              className="flex-1 rounded-lg data-[state=active]:bg-[#007AFF] data-[state=active]:text-white"
            >
              <Ruler className="w-4 h-4 mr-2" />
              ({measurements.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pins" className="flex-1 overflow-hidden mt-0">
          {pins.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No Pins Saved"
              description="Drop pins in AR view or tap on the map to save locations"
            />
          ) : (
            <div className="saved-list">
              {pins.map((pin) => (
                <div key={pin.id} className="saved-item" data-testid={`pin-item-${pin.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#FF4500]" />
                        <h4 className="font-bold text-white">{pin.name}</h4>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-mono text-[#00FF41]">
                          {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
                        </p>
                        {pin.altitude > 0 && (
                          <p className="text-xs text-white/50">
                            Altitude: {pin.altitude.toFixed(1)}m
                          </p>
                        )}
                        {pin.bearing !== undefined && pin.bearing !== null && (
                          <p className="text-xs text-white/50">
                            Bearing: {formatBearing(pin.bearing)}
                          </p>
                        )}
                        <p className="text-xs text-white/30">
                          {formatDate(pin.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      data-testid={`delete-pin-${pin.id}`}
                      onClick={() => handleDeletePin(pin.id)}
                      variant="ghost"
                      size="icon"
                      className="text-white/40 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="traces" className="flex-1 overflow-hidden mt-0">
          {traces.length === 0 ? (
            <EmptyState
              icon={Route}
              title="No Traces Saved"
              description="Start tracing in AR view to record your path"
            />
          ) : (
            <div className="saved-list">
              {traces.map((trace) => (
                <div key={trace.id} className="saved-item" data-testid={`trace-item-${trace.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Route className="w-4 h-4 text-[#00FF41]" />
                        <h4 className="font-bold text-white">{trace.name}</h4>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-lg font-mono font-bold text-[#00FF41]">
                          {formatDistance(trace.total_distance)}
                        </p>
                        <p className="text-xs text-white/50">
                          {trace.points.length} waypoints
                        </p>
                        <p className="text-xs text-white/30">
                          {formatDate(trace.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      data-testid={`delete-trace-${trace.id}`}
                      onClick={() => handleDeleteTrace(trace.id)}
                      variant="ghost"
                      size="icon"
                      className="text-white/40 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="measurements" className="flex-1 overflow-hidden mt-0">
          {measurements.length === 0 ? (
            <EmptyState
              icon={Ruler}
              title="No Measurements Saved"
              description="Use the measure tool in AR view to save distances"
            />
          ) : (
            <div className="saved-list">
              {measurements.map((m) => (
                <div key={m.id} className="saved-item" data-testid={`measurement-item-${m.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-[#007AFF]" />
                        <h4 className="font-bold text-white">{m.name}</h4>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-lg font-mono font-bold text-[#007AFF]">
                          {formatDistance(m.distance)}
                        </p>
                        <p className="text-sm text-white/60">
                          {formatBearing(m.bearing)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <span className="font-mono">
                            {m.start_point.latitude.toFixed(4)}, {m.start_point.longitude.toFixed(4)}
                          </span>
                          <ChevronRight className="w-3 h-3" />
                          <span className="font-mono">
                            {m.end_point.latitude.toFixed(4)}, {m.end_point.longitude.toFixed(4)}
                          </span>
                        </div>
                        <p className="text-xs text-white/30">
                          {formatDate(m.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      data-testid={`delete-measurement-${m.id}`}
                      onClick={() => handleDeleteMeasurement(m.id)}
                      variant="ghost"
                      size="icon"
                      className="text-white/40 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedView;
