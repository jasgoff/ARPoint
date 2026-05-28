import React, { useState } from 'react';
import { Upload, X, FileText, MapPin, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseKMLFile, validateKMLFile, mergeImportedPins } from '@/utils/kmlImport';
import { useApp } from '@/context/AppContext';

const ImportKMLMenu = ({ isOpen, onClose }) => {
  const { pins, setPins } = useApp();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [importOption, setImportOption] = useState('merge'); // 'merge' or 'replace'

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError(null);
    setSuccess(false);
    setImportStats(null);

    // Validate file
    const validation = validateKMLFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse KML file
      const importedPins = await parseKMLFile(file);

      if (importedPins.length === 0) {
        setError('No valid pins found in KML file');
        setImporting(false);
        return;
      }

      // Merge or replace pins
      const newPins = mergeImportedPins(
        pins,
        importedPins,
        {
          replace: importOption === 'replace',
          merge: importOption === 'merge',
          skipDuplicates: true
        }
      );

      // Update pins
      setPins(newPins);

      // Show success
      setImportStats({
        imported: importedPins.length,
        total: newPins.length,
        skipped: importOption === 'merge' ? (pins?.length || 0) + importedPins.length - newPins.length : 0
      });
      setSuccess(true);

      // Reset after delay
      setTimeout(() => {
        onClose();
        setFile(null);
        setImportStats(null);
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to import KML file');
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validation = validateKMLFile(droppedFile);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#007AFF]/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#007AFF]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Import KML</h2>
              <p className="text-sm text-white/60">Load pins from KML file</p>
            </div>
          </div>
        </div>

        {/* Success message */}
        {success && importStats && (
          <div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Import Successful!</span>
            </div>
            <div className="text-sm text-white/80">
              <div>✅ Imported: {importStats.imported} pins</div>
              {importStats.skipped > 0 && (
                <div>⏭️ Skipped duplicates: {importStats.skipped}</div>
              )}
              <div>📍 Total pins: {importStats.total}</div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* File upload area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`mb-4 p-8 rounded-xl border-2 border-dashed transition-colors ${
            file
              ? 'border-[#007AFF] bg-[#007AFF]/10'
              : 'border-white/20 bg-white/5 hover:border-white/40'
          }`}
        >
          <input
            type="file"
            accept=".kml,.kmz"
            onChange={handleFileSelect}
            className="hidden"
            id="kml-file-input"
          />
          
          {!file ? (
            <label
              htmlFor="kml-file-input"
              className="flex flex-col items-center cursor-pointer"
            >
              <FileText className="w-12 h-12 text-white/40 mb-3" />
              <p className="text-white font-medium mb-1">
                Drop KML file here or click to browse
              </p>
              <p className="text-white/40 text-sm">
                Supports .kml files up to 10MB
              </p>
            </label>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#007AFF]" />
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-white/60 text-sm">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Import options */}
        {file && !success && (
          <div className="mb-4 space-y-2">
            <label className="text-white/80 text-sm font-medium">Import Mode:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setImportOption('merge')}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  importOption === 'merge'
                    ? 'border-[#007AFF] bg-[#007AFF]/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40'
                }`}
              >
                <div className="text-sm font-medium mb-1">Merge</div>
                <div className="text-xs">Add to existing pins</div>
              </button>
              <button
                onClick={() => setImportOption('replace')}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  importOption === 'replace'
                    ? 'border-red-500 bg-red-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40'
                }`}
              >
                <div className="text-sm font-medium mb-1">Replace</div>
                <div className="text-xs">Clear & import</div>
              </button>
            </div>
          </div>
        )}

        {/* Current stats */}
        {pins && pins.length > 0 && !success && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Current pins: {pins.length}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing || success}
            className="flex-1 h-12 bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Importing...
              </span>
            ) : success ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Done!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import
              </span>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 rounded-lg bg-white/5">
          <p className="text-white/60 text-xs">
            💡 <strong>Tip:</strong> Exported KML files can be re-imported to restore your pins.
            Duplicate pins (same location) will be skipped automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportKMLMenu;
