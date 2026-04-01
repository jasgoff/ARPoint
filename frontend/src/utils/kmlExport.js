// KML Export utilities for AR Survey

/**
 * Generate KML content from pins, traces, and measurements
 */
export const generateKML = (pins = [], traces = [], measurements = [], appName = 'AR Survey') => {
  const timestamp = new Date().toISOString();
  
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>${appName} Export</name>
    <description>Exported on ${timestamp}</description>
    
    <!-- Styles -->
    <Style id="pinStyle">
      <IconStyle>
        <color>ff0045ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ffffffff</color>
        <scale>0.9</scale>
      </LabelStyle>
    </Style>
    
    <Style id="traceStyle">
      <LineStyle>
        <color>ff41ff00</color>
        <width>4</width>
      </LineStyle>
    </Style>
    
    <Style id="measureStyle">
      <LineStyle>
        <color>ffff7a00</color>
        <width>3</width>
      </LineStyle>
      <IconStyle>
        <color>ffff7a00</color>
        <scale>0.8</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href>
        </Icon>
      </IconStyle>
    </Style>

    <!-- Pins Folder -->
    <Folder>
      <name>Pins (${pins.length})</name>
      <description>Saved location pins</description>
${pins.map(pin => `      <Placemark>
        <name>${escapeXml(pin.name)}</name>
        <description><![CDATA[
          <b>Coordinates:</b> ${pin.latitude.toFixed(6)}, ${pin.longitude.toFixed(6)}<br/>
          <b>Altitude:</b> ${(pin.altitude || 0).toFixed(1)}m<br/>
          ${pin.bearing !== undefined ? `<b>Bearing:</b> ${pin.bearing.toFixed(1)}°<br/>` : ''}
          ${pin.notes ? `<b>Notes:</b> ${escapeXml(pin.notes)}<br/>` : ''}
          <b>Created:</b> ${pin.created_at || 'Unknown'}
        ]]></description>
        <styleUrl>#pinStyle</styleUrl>
        <Point>
          <altitudeMode>clampToGround</altitudeMode>
          <coordinates>${pin.longitude},${pin.latitude},${pin.altitude || 0}</coordinates>
        </Point>
      </Placemark>`).join('\n')}
    </Folder>

    <!-- Traces Folder -->
    <Folder>
      <name>Traces (${traces.length})</name>
      <description>Recorded paths</description>
${traces.map(trace => `      <Placemark>
        <name>${escapeXml(trace.name)}</name>
        <description><![CDATA[
          <b>Total Distance:</b> ${formatDistance(trace.total_distance)}<br/>
          <b>Points:</b> ${trace.points?.length || 0}<br/>
          <b>Created:</b> ${trace.created_at || 'Unknown'}
        ]]></description>
        <styleUrl>#traceStyle</styleUrl>
        <LineString>
          <altitudeMode>clampToGround</altitudeMode>
          <coordinates>
${(trace.points || []).map(p => `            ${p.longitude},${p.latitude},${p.altitude || 0}`).join('\n')}
          </coordinates>
        </LineString>
      </Placemark>`).join('\n')}
    </Folder>

    <!-- Measurements Folder -->
    <Folder>
      <name>Measurements (${measurements.length})</name>
      <description>Distance measurements</description>
${measurements.map(m => `      <Placemark>
        <name>${escapeXml(m.name)}</name>
        <description><![CDATA[
          <b>Distance:</b> ${formatDistance(m.distance)}<br/>
          <b>Bearing:</b> ${m.bearing?.toFixed(1) || 0}°<br/>
          <b>Start:</b> ${m.start_point?.latitude?.toFixed(6)}, ${m.start_point?.longitude?.toFixed(6)}<br/>
          <b>End:</b> ${m.end_point?.latitude?.toFixed(6)}, ${m.end_point?.longitude?.toFixed(6)}<br/>
          <b>Created:</b> ${m.created_at || 'Unknown'}
        ]]></description>
        <styleUrl>#measureStyle</styleUrl>
        <LineString>
          <altitudeMode>clampToGround</altitudeMode>
          <coordinates>
            ${m.start_point?.longitude},${m.start_point?.latitude},${m.start_point?.altitude || 0}
            ${m.end_point?.longitude},${m.end_point?.latitude},${m.end_point?.altitude || 0}
          </coordinates>
        </LineString>
      </Placemark>
      <Placemark>
        <name>${escapeXml(m.name)} - Start</name>
        <styleUrl>#measureStyle</styleUrl>
        <Point>
          <coordinates>${m.start_point?.longitude},${m.start_point?.latitude},${m.start_point?.altitude || 0}</coordinates>
        </Point>
      </Placemark>
      <Placemark>
        <name>${escapeXml(m.name)} - End</name>
        <styleUrl>#measureStyle</styleUrl>
        <Point>
          <coordinates>${m.end_point?.longitude},${m.end_point?.latitude},${m.end_point?.altitude || 0}</coordinates>
        </Point>
      </Placemark>`).join('\n')}
    </Folder>

  </Document>
</kml>`;

  return kml;
};

/**
 * Download KML file
 */
export const downloadKML = (pins, traces, measurements, filename = 'ar-survey-export') => {
  const kmlContent = generateKML(pins, traces, measurements);
  const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.kml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Escape XML special characters
 */
const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Format distance for display
 */
const formatDistance = (meters) => {
  if (!meters) return '0 m';
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Geocode an address or zipcode using OpenStreetMap Nominatim
 */
export const geocodeLocation = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'AR Survey PWA/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const results = await response.json();
    
    return results.map(r => ({
      display_name: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      type: r.type,
      importance: r.importance
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'AR Survey PWA/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const result = await response.json();
    
    return {
      display_name: result.display_name,
      address: result.address
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};
