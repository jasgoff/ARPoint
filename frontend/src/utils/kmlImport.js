// KML Import Utility
// Parses KML files and extracts placemarks (pins)

export const parseKML = (kmlText) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
  
  // Check for parse errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid KML file format');
  }

  const placemarks = [];
  const placemarkElements = xmlDoc.getElementsByTagName('Placemark');

  for (let i = 0; i < placemarkElements.length; i++) {
    const placemark = placemarkElements[i];
    
    // Extract name
    const nameElement = placemark.getElementsByTagName('name')[0];
    const name = nameElement ? nameElement.textContent : `Pin ${i + 1}`;

    // Extract description
    const descElement = placemark.getElementsByTagName('description')[0];
    const description = descElement ? descElement.textContent : '';

    // Extract coordinates
    const coordElement = placemark.getElementsByTagName('coordinates')[0];
    if (!coordElement) continue;

    const coordText = coordElement.textContent.trim();
    const coords = coordText.split(',');
    
    if (coords.length >= 2) {
      const longitude = parseFloat(coords[0]);
      const latitude = parseFloat(coords[1]);
      const altitude = coords.length >= 3 ? parseFloat(coords[2]) : 0;

      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude)) continue;
      if (latitude < -90 || latitude > 90) continue;
      if (longitude < -180 || longitude > 180) continue;

      // Extract style (color)
      let color = '#FF4500'; // Default orange
      const styleUrl = placemark.getElementsByTagName('styleUrl')[0];
      if (styleUrl) {
        const styleId = styleUrl.textContent.replace('#', '');
        const style = xmlDoc.getElementById(styleId);
        if (style) {
          const colorElement = style.getElementsByTagName('color')[0];
          if (colorElement) {
            // KML color format: aabbggrr (hex)
            const kmlColor = colorElement.textContent;
            // Convert to standard #RRGGBB
            if (kmlColor.length >= 8) {
              const r = kmlColor.substring(6, 8);
              const g = kmlColor.substring(4, 6);
              const b = kmlColor.substring(2, 4);
              color = `#${r}${g}${b}`;
            }
          }
        }
      }

      placemarks.push({
        id: `imported-${Date.now()}-${i}`,
        name,
        description,
        latitude,
        longitude,
        altitude,
        color,
        timestamp: new Date().toISOString(),
        imported: true,
        source: 'kml'
      });
    }
  }

  return placemarks;
};

export const parseKMLFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const kmlText = e.target.result;
        const pins = parseKML(kmlText);
        resolve(pins);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const validateKMLFile = (file) => {
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.kml') && !fileName.endsWith('.kmz')) {
    return { valid: false, error: 'File must be .kml or .kmz format' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true };
};

export const mergeImportedPins = (existingPins, importedPins, options = {}) => {
  const {
    replace = false, // Replace all existing pins
    merge = true,    // Merge with existing
    skipDuplicates = true // Skip pins with same coordinates
  } = options;

  if (replace) {
    return importedPins;
  }

  if (!merge) {
    return existingPins;
  }

  const merged = [...existingPins];
  
  for (const importedPin of importedPins) {
    // Check for duplicates (same location within ~1 meter)
    const isDuplicate = existingPins.some(existing => {
      const latDiff = Math.abs(existing.latitude - importedPin.latitude);
      const lonDiff = Math.abs(existing.longitude - importedPin.longitude);
      return latDiff < 0.00001 && lonDiff < 0.00001; // ~1 meter
    });

    if (!isDuplicate || !skipDuplicates) {
      merged.push(importedPin);
    }
  }

  return merged;
};

export const getKMLStats = (kmlText) => {
  try {
    const pins = parseKML(kmlText);
    
    return {
      totalPins: pins.length,
      hasNames: pins.filter(p => p.name && p.name !== 'Pin').length,
      hasDescriptions: pins.filter(p => p.description).length,
      hasAltitude: pins.filter(p => p.altitude > 0).length,
      bounds: getBounds(pins)
    };
  } catch (error) {
    return null;
  }
};

const getBounds = (pins) => {
  if (pins.length === 0) return null;

  const lats = pins.map(p => p.latitude);
  const lons = pins.map(p => p.longitude);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lons),
    west: Math.min(...lons),
    center: {
      latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
      longitude: (Math.max(...lons) + Math.min(...lons)) / 2
    }
  };
};
