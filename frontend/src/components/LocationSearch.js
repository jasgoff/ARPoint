import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { geocodeLocation } from '@/utils/kmlExport';
import { useApp } from '@/context/AppContext';

const LocationSearch = ({ onClose }) => {
  const { setPosition, position } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Debounced search
  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await geocodeLocation(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  }, [handleSearch]);

  // Select a location
  const handleSelectLocation = useCallback((result) => {
    setPosition({
      latitude: result.latitude,
      longitude: result.longitude
    });
    setQuery(result.display_name.split(',')[0]);
    setResults([]);
    setIsExpanded(false);
    if (onClose) onClose();
  }, [setPosition, onClose]);

  // Use current GPS location
  const handleUseGPS = useCallback(() => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setQuery('');
          setResults([]);
          setIsExpanded(false);
          setLoading(false);
          if (onClose) onClose();
        },
        (err) => {
          setError('Could not get GPS location');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [setPosition, onClose]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  if (!isExpanded) {
    return (
      <button
        data-testid="location-search-toggle"
        onClick={() => setIsExpanded(true)}
        className="glass-panel rounded-full p-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
      >
        <Search className="w-4 h-4 text-white/70" />
        <span className="text-xs text-white/70 pr-1">
          {position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : 'Set Location'}
        </span>
      </button>
    );
  }

  return (
    <div 
      className="glass-panel rounded-xl p-3 w-full max-w-sm"
      data-testid="location-search-panel"
    >
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Address, city, or zipcode..."
          className="w-full h-10 pl-10 pr-10 bg-black/40 border border-white/20 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#FF4500]"
          data-testid="location-search-input"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* GPS button */}
      <button
        onClick={handleUseGPS}
        disabled={loading}
        className="w-full mt-2 h-9 flex items-center justify-center gap-2 bg-[#007AFF]/20 hover:bg-[#007AFF]/30 text-[#007AFF] rounded-lg text-sm font-medium transition-colors"
        data-testid="use-gps-btn"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        Use GPS Location
      </button>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectLocation(result)}
              className="w-full p-2 flex items-start gap-2 hover:bg-white/10 rounded-lg transition-colors text-left"
              data-testid={`location-result-${index}`}
            >
              <MapPin className="w-4 h-4 text-[#FF4500] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {result.display_name.split(',')[0]}
                </div>
                <div className="text-white/50 text-xs truncate">
                  {result.display_name.split(',').slice(1).join(',').trim()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loading && !results.length && (
        <div className="mt-3 flex items-center justify-center gap-2 text-white/50 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Searching...
        </div>
      )}

      {/* Close button */}
      <button
        onClick={() => {
          setIsExpanded(false);
          if (onClose) onClose();
        }}
        className="w-full mt-2 h-8 text-white/50 hover:text-white text-xs"
      >
        Cancel
      </button>
    </div>
  );
};

export default LocationSearch;
