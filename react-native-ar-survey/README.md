# AR Survey Mobile - React Native App

A professional AR surveying app for Android and iOS, built with React Native and Expo.

## Features

- 📍 **Pin Drop** - Save GPS locations with names
- 📏 **Distance Measurement** - Measure distances between two points
- 🧭 **3D Compass** - Glass marble compass with bubble level
- 🗺️ **Satellite Map** - View pins and traces on satellite imagery
- 📱 **AR View** - Camera view with coordinate overlay
- 💾 **Local Storage** - All data stored securely on device

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Expo Go app on your phone (for quick testing)

### Installation

```bash
# Navigate to the React Native project
cd react-native-ar-survey

# Install dependencies
npm install
# or
yarn install

# Start the development server
npx expo start
```

### Running on Device

**Using Expo Go (Quickest):**
1. Install "Expo Go" from Play Store / App Store
2. Run `npx expo start`
3. Scan the QR code with your phone

**Android Emulator:**
```bash
npx expo start --android
```

**iOS Simulator (macOS only):**
```bash
npx expo start --ios
```

### Building APK for Android

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure the project (first time only)
eas build:configure

# Build APK (preview profile)
eas build --platform android --profile preview
```

The APK will be available for download from your Expo dashboard.

### Building for Production

```bash
# Android App Bundle (for Play Store)
eas build --platform android --profile production

# iOS (for App Store)
eas build --platform ios --profile production
```

## Project Structure

```
react-native-ar-survey/
├── App.js                 # App entry point
├── app.json               # Expo config
├── package.json           # Dependencies
├── eas.json               # EAS Build config
├── assets/                # App icons and splash
└── src/
    ├── components/        # Reusable components
    │   └── Compass3D.js   # 3D compass component
    ├── context/           # React Context providers
    │   ├── AppContext.js  # App state management
    │   └── AuthContext.js # Authentication
    ├── navigation/        # Navigation setup
    │   └── RootNavigator.js
    ├── screens/           # App screens
    │   ├── LoginScreen.js
    │   ├── ARViewScreen.js
    │   ├── MapViewScreen.js
    │   ├── SavedScreen.js
    │   └── SettingsScreen.js
    └── utils/             # Utility functions
```

## Key Dependencies

- `expo-camera` - Camera access for AR view
- `expo-location` - GPS and location services
- `expo-sensors` - Magnetometer and accelerometer
- `react-native-maps` - Google Maps integration
- `@react-native-async-storage/async-storage` - Local data persistence

## Permissions Required

### Android
- `CAMERA` - AR camera view
- `ACCESS_FINE_LOCATION` - GPS coordinates
- `ACCESS_COARSE_LOCATION` - Approximate location
- `HIGH_SAMPLING_RATE_SENSORS` - Compass accuracy

### iOS
- Camera Usage
- Location When In Use
- Motion Usage (compass)

## Customization

### Changing App Name/Icon

Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "icon": "./assets/icon.png"
  }
}
```

### Adding Google OAuth

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Sign-In
3. Add credentials to `app.json`:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### Adding Backend Sync

Update `src/context/AuthContext.js` with your backend URL:
```javascript
const BACKEND_URL = 'https://your-backend.com';
```

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted
- Check that you're testing on a real device (simulators have limited camera support)

### GPS not accurate
- Test outdoors for better satellite signal
- Enable "High Accuracy" mode in device settings

### Build fails
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall
- Update Expo: `expo upgrade`

## License

MIT License - See LICENSE file

## Support

For issues and feature requests, please open an issue on GitHub.
