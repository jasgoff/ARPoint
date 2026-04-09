# 📱 Android APK Build Guide - AR Survey PWA

## Overview

This guide provides **three methods** to build an Android APK from the AR Survey PWA:

1. **Expo/EAS Build** (Cloud-based, easiest, recommended)
2. **Capacitor** (Convert PWA to native Android)
3. **React Native** (Full native development)

---

## ✅ Method 1: EAS Build (RECOMMENDED - Cloud-based)

### Prerequisites
- Expo account (free): https://expo.dev/signup
- Node.js 18+ installed locally on your machine

### Steps

#### 1. Install EAS CLI locally
```bash
npm install -g eas-cli
```

#### 2. Download the project
Download the `/app/react-native-ar-survey` folder from this project.

#### 3. Navigate to the folder
```bash
cd react-native-ar-survey
```

#### 4. Install dependencies
```bash
yarn install
# or
npm install
```

#### 5. Login to Expo
```bash
eas login
```

#### 6. Configure the build
```bash
eas build:configure
```

#### 7. Build APK
```bash
eas build --platform android --profile preview
```

This will:
- Upload your code to Expo servers
- Build the APK in the cloud
- Provide a download link when complete (~10-15 minutes)

#### 8. Download APK
After the build completes, you'll get a download link. The APK can be installed on any Android device.

### EAS Build Configuration

The project already has `eas.json` configured:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 🔧 Method 2: Capacitor (PWA to Native)

### Prerequisites
- Node.js 22+ (required for Capacitor 8)
- Android Studio installed
- Java JDK 17+

### Steps

#### 1. Update Node.js to v22+
```bash
# Using nvm (recommended)
nvm install 22
nvm use 22
```

#### 2. Install Capacitor
```bash
cd /app/frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
```

#### 3. Initialize Capacitor
```bash
npx cap init "AR Survey" "com.arsurvey.app" --web-dir=build
```

#### 4. Build the React app
```bash
yarn build
```

#### 5. Add Android platform
```bash
npx cap add android
```

#### 6. Sync files to Android
```bash
npx cap sync android
```

#### 7. Open in Android Studio
```bash
npx cap open android
```

#### 8. Build APK in Android Studio
1. In Android Studio: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Required Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 🚀 Method 3: React Native Full Build

### Prerequisites
- Node.js 18+
- Android Studio with SDK
- Java JDK 17+
- Gradle

### Steps

#### 1. Navigate to React Native project
```bash
cd /app/react-native-ar-survey
```

#### 2. Install dependencies
```bash
yarn install
```

#### 3. Update app configuration
Edit `app.json`:
```json
{
  "expo": {
    "name": "AR Survey",
    "slug": "ar-survey",
    "version": "1.0.0",
    "android": {
      "package": "com.arsurvey.app",
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

#### 4. Generate native Android folder
```bash
npx expo prebuild --platform android
```

#### 5. Build APK
```bash
cd android
./gradlew assembleRelease
```

#### 6. Find APK
```bash
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Quick Test Build (No Code Required)

### Using Expo Snack
1. Go to https://snack.expo.dev
2. Upload your React Native code
3. Scan QR code with Expo Go app on Android
4. Test instantly without building APK

---

## 🎯 Recommended Workflow

### For Quick Testing:
**Use EAS Build (Method 1)**
- No local Android setup required
- Cloud-based, always works
- Download APK in 15 minutes
- Free tier available

### For Development:
**Use Expo Go App**
- Install "Expo Go" from Play Store
- Run `npx expo start` locally
- Scan QR code
- Instant testing without building APK

### For Production:
**Use EAS Build with Production Profile**
```bash
eas build --platform android --profile production
```

---

## 📝 Current Project Status

### PWA (Ready ✅)
- Fully functional web app at: `https://web-dev-101-3.preview.emergentagent.com`
- Works in mobile browsers
- Can be "installed" as PWA
- All features working

### React Native (Boilerplate Only ⚠️)
- Basic structure created
- **Needs feature implementation**
- Currently just a scaffold

---

## 🔄 Converting PWA to Native (Detailed)

### Option A: WebView Wrapper (Quick)
Create a simple React Native app that loads the PWA in a WebView:

```javascript
// App.js
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView
      source={{ uri: 'https://your-pwa-url.com' }}
      geolocationEnabled={true}
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback={true}
    />
  );
}
```

### Option B: Full Native Implementation (Best UX)
Rebuild all PWA features in React Native:
- Use `react-native-camera` for AR camera
- Use `@react-native-community/geolocation` for GPS
- Use `react-native-sensors` for compass
- Use `react-native-maps` for map view

---

## 🛠️ Build Environment Requirements

### For EAS Build (Cloud):
- ✅ No special requirements
- ✅ Works from any machine
- ✅ Handles all dependencies

### For Local Build:
- Node.js 18+ (preferably 22+ for Capacitor)
- Android Studio (with Android SDK 33+)
- Java JDK 17+
- Gradle 8+
- 8GB+ RAM
- 20GB+ free disk space

---

## 📲 Installing APK on Device

### Enable Installation:
1. On Android device: **Settings** → **Security** → **Install unknown apps**
2. Enable for your file manager or browser

### Transfer APK:
1. **USB**: Connect device, copy APK to Downloads folder
2. **Email**: Email APK to yourself, download on device
3. **Cloud**: Upload to Google Drive, download on device
4. **Direct**: Serve APK via local HTTP server

### Install:
1. Open APK file on device
2. Tap "Install"
3. Open "AR Survey" app

---

## 🔒 Signing APK for Release

### Generate Keystore:
```bash
keytool -genkey -v -keystore ar-survey.keystore -alias ar-survey -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Gradle:
Edit `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("ar-survey.keystore")
            storePassword "your-password"
            keyAlias "ar-survey"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Build Signed APK:
```bash
./gradlew assembleRelease
```

---

## 🎯 Next Steps

### Immediate (For Testing):
1. **Use EAS Build** - Easiest method to get APK now
2. **Or use Expo Go** - Test without building APK

### Short-term (For Development):
1. Implement WebView wrapper for quick native app
2. Test on real Android devices
3. Iterate based on feedback

### Long-term (For Production):
1. Build full React Native implementation
2. Optimize native performance
3. Publish to Google Play Store

---

## 📞 Support & Resources

- **Expo Docs**: https://docs.expo.dev
- **Capacitor Docs**: https://capacitorjs.com
- **React Native Docs**: https://reactnative.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/

---

## 🚨 Important Notes

1. **Camera permissions** must be requested in Android
2. **HTTPS required** for geolocation and camera on web
3. **GPS accuracy** better in native app than PWA
4. **Compass sensor** more reliable in native Android
5. **Background GPS** only works in native app, not PWA

---

*Last Updated: 2026-04-02*
*AR Survey PWA v1.2.0*
