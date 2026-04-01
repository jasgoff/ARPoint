import React, { useState } from 'react';
import { Download, FileDown, X, MapPin, Route, Ruler, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { downloadKML } from '@/utils/kmlExport';

const ExportMenu = ({ isOpen, onClose }) => {
  const { getPins, getTraces, getMeasurements } = useApp();
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState({
    pins: true,
    traces: true,
    measurements: true
  });

  const pins = getPins();
  const traces = getTraces();
  const measurements = getMeasurements();

  const totalItems = 
    (selectedTypes.pins ? pins.length : 0) +
    (selectedTypes.traces ? traces.length : 0) +
    (selectedTypes.measurements ? measurements.length : 0);

  const handleExport = () => {
    const exportPins = selectedTypes.pins ? pins : [];
    const exportTraces = selectedTypes.traces ? traces : [];
    const exportMeasurements = selectedTypes.measurements ? measurements : [];

    downloadKML(exportPins, exportTraces, exportMeasurements, 'ar-survey-data');
    
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
      onClose();
    }, 2000);
  };

  const toggleType = (type) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div className="glass-panel w-full max-w-md rounded-t-3xl p-6 slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF41]/20 flex items-center justify-center">
              <FileDown className="w-5 h-5 text-[#00FF41]" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Export to KML</h3>
              <p className="text-white/50 text-sm">Google Earth / Maps format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success state */}
        {exportSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-[#00FF41] mx-auto mb-4" />
            <p className="text-white font-bold text-lg">Export Complete!</p>
            <p className="text-white/50 text-sm mt-2">Check your downloads folder</p>
          </div>
        ) : (
          <>
            {/* Data type selection */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => toggleType('pins')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                  selectedTypes.pins 
                    ? 'bg-[#FF4500]/10 border-[#FF4500]/50' 
                    : 'bg-white/5 border-white/10'
                }`}
                data-testid="export-toggle-pins"
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${selectedTypes.pins ? 'text-[#FF4500]' : 'text-white/40'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${selectedTypes.pins ? 'text-white' : 'text-white/60'}`}>
                      Pins
                    </div>
                    <div className="text-xs text-white/40">{pins.length} locations</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedTypes.pins ? 'bg-[#FF4500] border-[#FF4500]' : 'border-white/30'
                }`}>
                  {selectedTypes.pins && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
              </button>

              <button
                onClick={() => toggleType('traces')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                  selectedTypes.traces 
                    ? 'bg-[#00FF41]/10 border-[#00FF41]/50' 
                    : 'bg-white/5 border-white/10'
                }`}
                data-testid="export-toggle-traces"
              >
                <div className="flex items-center gap-3">
                  <Route className={`w-5 h-5 ${selectedTypes.traces ? 'text-[#00FF41]' : 'text-white/40'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${selectedTypes.traces ? 'text-white' : 'text-white/60'}`}>
                      Traces
                    </div>
                    <div className="text-xs text-white/40">{traces.length} paths</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedTypes.traces ? 'bg-[#00FF41] border-[#00FF41]' : 'border-white/30'
                }`}>
                  {selectedTypes.traces && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
              </button>

              <button
                onClick={() => toggleType('measurements')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                  selectedTypes.measurements 
                    ? 'bg-[#007AFF]/10 border-[#007AFF]/50' 
                    : 'bg-white/5 border-white/10'
                }`}
                data-testid="export-toggle-measurements"
              >
                <div className="flex items-center gap-3">
                  <Ruler className={`w-5 h-5 ${selectedTypes.measurements ? 'text-[#007AFF]' : 'text-white/40'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${selectedTypes.measurements ? 'text-white' : 'text-white/60'}`}>
                      Measurements
                    </div>
                    <div className="text-xs text-white/40">{measurements.length} lines</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedTypes.measurements ? 'bg-[#007AFF] border-[#007AFF]' : 'border-white/30'
                }`}>
                  {selectedTypes.measurements && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
              </button>
            </div>

            {/* Export info */}
            <div className="glass-panel rounded-xl p-4 mb-6 text-center">
              <div className="text-2xl font-bold text-white font-mono">{totalItems}</div>
              <div className="text-white/50 text-sm">items to export</div>
            </div>

            {/* Export button */}
            <Button
              onClick={handleExport}
              disabled={totalItems === 0}
              className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="export-kml-btn"
            >
              <Download className="w-5 h-5" />
              Download KML File
            </Button>

            <p className="text-center text-white/40 text-xs mt-4">
              KML files can be imported into Google Earth, Google Maps, and other GIS software
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ExportMenu;
