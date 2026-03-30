# AR Survey PWA - Product Requirements Document

## Original Problem Statement
AR surveying/mapping PWA application with:
- Phone orientation reading
- GPS with high accuracy
- AR camera functionality
- Tap location with 3D distance measurement and persistent trace
- Pin drop location with lines
- Satellite view via OpenStreetMap/ESRI
- 3D compass function
- Panoramic image capture for mapping
- Bearing calculations
- Google OAuth login

## User Choices
- **Platform**: PWA (Progressive Web App) - works in mobile browser
- **GPS**: Device GPS with high accuracy mode
- **AR Framework**: AR.js / Native WebRTC for camera
- **Maps**: OpenStreetMap + ESRI satellite tiles (free)
- **Authentication**: Google OAuth via Emergent Auth
- **Data Storage**: Local storage (offline-first)

## User Personas

### 1. Field Surveyor
- Needs accurate GPS coordinates
- Uses distance/bearing measurements
- Saves pins for later reference
- Works offline in remote areas

### 2. Land Developer
- Needs satellite view for site analysis
- Traces property boundaries
- Measures distances between points
- Exports data for documentation

### 3. Outdoor Enthusiast
- Uses 3D compass for navigation
- Drops pins at points of interest
- Tracks hiking routes with trace

## Core Requirements (Static)

### Authentication
- [x] Google OAuth login via Emergent Auth
- [x] Session management with httpOnly cookies
- [x] Protected routes requiring authentication
- [x] Logout functionality

### AR View
- [x] Camera access with getUserMedia
- [x] 3D compass overlay with device orientation
- [x] GPS coordinates display (lat/lng/alt)
- [x] Accuracy indicator
- [x] Pin drop mode with crosshair
- [x] Measurement mode (start/end points)
- [x] Trace mode (continuous path recording)
- [x] Save dialog for naming saved items

### Map View
- [x] Leaflet map with ESRI satellite tiles
- [x] Toggle between satellite/street view
- [x] Current position marker
- [x] Pin markers with popups
- [x] Trace polylines
- [x] Measurement lines with start/end markers
- [x] Add pin by tapping map
- [x] Center on current position button

### Saved View
- [x] Tabbed interface (Pins, Traces, Measurements)
- [x] List view for each type
- [x] Delete functionality
- [x] Empty states with guidance
- [x] Display coordinates, distance, bearing

### Settings View
- [x] User profile display
- [x] Unit toggle (Metric/Imperial)
- [x] Display options (coordinates, altitude, 3D compass)
- [x] Map type preference
- [x] Logout button

### Data Management
- [x] Local storage for pins, traces, measurements
- [x] Settings persistence
- [x] Haversine distance calculation
- [x] Bearing calculation

## What's Been Implemented

### Phase 1: MVP (2026-03-30)
- Complete PWA with Google OAuth
- AR View with camera, compass, GPS overlay
- Map View with satellite tiles
- Saved View with all data types
- Settings View with preferences
- Local storage persistence
- Distance/bearing calculations
- Mobile-optimized dark UI

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- [ ] Offline mode with service worker
- [ ] Export data (GPX, KML, CSV)
- [ ] Share pins/traces via link
- [ ] Photo attachment to pins

### P2 (Medium Priority)
- [ ] Panoramic image capture
- [ ] RTK/GNSS integration for high accuracy
- [ ] Cloud sync option (MongoDB)
- [ ] Multi-point measurement (polygon area)

### P3 (Nice to Have)
- [ ] Voice notes on pins
- [ ] Batch import from GPS devices
- [ ] Team collaboration features
- [ ] AR object placement

## Technical Architecture

### Frontend
- React 19 with React Router
- Tailwind CSS with custom dark theme
- Leaflet + react-leaflet for maps
- Device Orientation API for compass
- Geolocation API for GPS
- MediaDevices API for camera

### Backend
- FastAPI with async endpoints
- MongoDB for user sessions
- Emergent Auth for Google OAuth
- httpOnly cookie authentication

### Data Flow
1. User authenticates via Google OAuth
2. Session stored in MongoDB, token in cookie
3. App data stored in localStorage
4. GPS/orientation from device sensors
5. Map tiles from ESRI/OpenStreetMap CDN

## Next Tasks

1. Add service worker for offline support
2. Implement data export (GPX format)
3. Add photo capture and attachment to pins
4. Consider React Native version for deeper hardware access
