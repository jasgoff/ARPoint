import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Generate KML content from pins, traces, and measurements
 */
export const generateKML = (pins = [], traces = [], measurements = []) => {
  const timestamp = new Date().toISOString();
  
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>AR Survey Export</name>
    <description>Exported on ${timestamp}</description>
    
    <Style id="pinStyle">
      <IconStyle>
        <color>ff0045ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
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
    </Style>

    <Folder>
      <name>Pins (${pins.length})</name>
${pins.map(pin => `      <Placemark>
        <name>${escapeXml(pin.name)}</name>
        <description>Lat: ${pin.latitude.toFixed(6)}, Lng: ${pin.longitude.toFixed(6)}</description>
        <styleUrl>#pinStyle</styleUrl>
        <Point>
          <coordinates>${pin.longitude},${pin.latitude},${pin.altitude || 0}</coordinates>
        </Point>
      </Placemark>`).join('\n')}
    </Folder>

    <Folder>
      <name>Traces (${traces.length})</name>
${traces.map(trace => `      <Placemark>
        <name>${escapeXml(trace.name)}</name>
        <description>Distance: ${formatDistance(trace.total_distance)}</description>
        <styleUrl>#traceStyle</styleUrl>
        <LineString>
          <coordinates>
${(trace.points || []).map(p => `            ${p.longitude},${p.latitude},${p.altitude || 0}`).join('\n')}
          </coordinates>
        </LineString>
      </Placemark>`).join('\n')}
    </Folder>

    <Folder>
      <name>Measurements (${measurements.length})</name>
${measurements.map(m => `      <Placemark>
        <name>${escapeXml(m.name)}</name>
        <description>Distance: ${formatDistance(m.distance)}, Bearing: ${m.bearing?.toFixed(1) || 0}</description>
        <styleUrl>#measureStyle</styleUrl>
        <LineString>
          <coordinates>
            ${m.start_point?.longitude},${m.start_point?.latitude},${m.start_point?.altitude || 0}
            ${m.end_point?.longitude},${m.end_point?.latitude},${m.end_point?.altitude || 0}
          </coordinates>
        </LineString>
      </Placemark>`).join('\n')}
    </Folder>

  </Document>
</kml>`;

  return kml;
};

/**
 * Export and share KML file
 */
export const exportKML = async (pins, traces, measurements) => {
  try {
    const kmlContent = generateKML(pins, traces, measurements);
    const filename = `ar-survey-${new Date().toISOString().split('T')[0]}.kml`;
    const fileUri = FileSystem.documentDirectory + filename;
    
    await FileSystem.writeAsStringAsync(fileUri, kmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.google-earth.kml+xml',
        dialogTitle: 'Export KML File',
      });
    }
    
    return true;
  } catch (error) {
    console.error('KML export error:', error);
    throw error;
  }
};

const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const formatDistance = (meters) => {
  if (!meters) return '0 m';
  if (meters < 1000) return `${meters.toFixed(1)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};
