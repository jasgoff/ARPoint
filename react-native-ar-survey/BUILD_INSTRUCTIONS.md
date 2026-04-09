# 📱 AR Survey - Quick APK Build Instructions

## 🚀 Fastest Method: Cloud Build with EAS (15 minutes)

### Prerequisites
- Computer with internet connection
- Expo account (create free at https://expo.dev/signup)

### Step-by-Step Instructions

#### 1. Install EAS CLI on your computer
```bash
npm install -g eas-cli
```

#### 2. Download the React Native project
Download or clone this entire `/app/react-native-ar-survey` folder to your local machine.

#### 3. Navigate to the folder
```bash
cd react-native-ar-survey
```

#### 4. Install dependencies
```bash
npm install
# or
yarn install
```

#### 5. Login to Expo
```bash
eas login
```
Enter your Expo credentials.

#### 6. Configure EAS (first time only)
```bash
eas build:configure
```
This will create/update `eas.json` and link your project to Expo.

#### 7. Build APK
```bash
eas build --platform android --profile preview
```

This command will:
- ✅ Upload your code to Expo's cloud servers
- ✅ Build the APK remotely (takes ~10-15 minutes)
- ✅ Provide a download link when complete

#### 8. Download your APK
Once the build completes, you'll see:
```
✔ Build finished
📱 Install the build on a physical device:
   https://expo.dev/artifacts/eas/[build-id].apk
```

Click the link to download your APK!

---

## 📦 What's Included

The React Native app is configured with:

### Two App Versions Available:

**1. WebView Version (Quickest - Currently Configured)**
- File: `App.webview.js`
- Wraps your PWA in a native Android app
- ✅ All PWA features work immediately
- ✅ Native camera, GPS, and sensor access
- ✅ Offline support
- ⚠️ Requires internet connection to load PWA

**2. Full Native Version (Best Performance)**
- File: `App.js` (original)
- Full React Native implementation
- ⚠️ Requires implementing all features natively
- 📝 More development work needed

### Current Configuration:
The app is set to use the **WebView version** by default, pointing to:
```
https://web-dev-101-3.preview.emergentagent.com
```

---

## 🔧 Switching Between Versions

### To use WebView version (current):
1. Rename `App.js` to `App.native.js` (backup)
2. Rename `App.webview.js` to `App.js`

### To use Native version:
1. Rename `App.js` to `App.webview.js` (backup)
2. Rename `App.native.js` to `App.js`

---

## ⚙️ Configuration

### Update PWA URL (for WebView version):
Edit `App.webview.js`:
```javascript
const PWA_URL = 'YOUR_DEPLOYED_PWA_URL_HERE';
```

### Update App Info:
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

---

## 📲 Installing APK on Android Device

### Enable Installation:
1. On your Android device, go to:
   **Settings** → **Security** → **Install unknown apps**
2. Enable for your browser or file manager

### Transfer & Install:
**Method 1: Direct Download**
- Email the APK download link to yourself
- Open email on Android device
- Tap link to download
- Tap downloaded file to install

**Method 2: USB Transfer**
- Connect Android device via USB
- Copy APK to device's `Downloads` folder
- On device, open `Files` app → `Downloads`
- Tap the APK file to install

**Method 3: Cloud Storage**
- Upload APK to Google Drive/Dropbox
- Download on Android device
- Tap to install

---

## 🧪 Testing Without Building APK

### Use Expo Go App (Instant Testing):
1. Install **Expo Go** from Google Play Store
2. On your computer:
   ```bash
   cd react-native-ar-survey
   npx expo start
   ```
3. Scan QR code with Expo Go app
4. Test immediately!

---

## 📋 Permissions Included

The APK includes permissions for:
- ✅ Camera (for AR features)
- ✅ GPS/Location (for coordinates and navigation)
- ✅ Motion sensors (for compass and orientation)
- ✅ Internet (for loading PWA content)
- ✅ Storage (for saving data locally)

---

## 🔐 Building Signed APK (for Production)

For Google Play Store or production use:

```bash
eas build --platform android --profile production
```

This creates an AAB (Android App Bundle) instead of APK, which is required for Play Store.

---

## 📞 Need Help?

### Common Issues:

**"Build failed" error:**
- Check your `app.json` is valid JSON
- Ensure all dependencies are in `package.json`
- Try running `npm install` again

**"Login failed" error:**
- Create account at https://expo.dev/signup
- Try `eas login` again

**APK won't install:**
- Enable "Install unknown apps" on device
- Check Android version (minimum: Android 6.0)

### Resources:
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- React Native WebView: https://github.com/react-native-webview/react-native-webview

---

## 🎯 Next Steps After Building

1. **Install APK** on your Android device
2. **Test all features**:
   - Camera access
   - GPS accuracy
   - Compass orientation
   - Pin dropping
   - Map view
   - Data saving
3. **Report any issues** you find
4. **Share APK** with testers

---

## 📝 Build Configurations

The project includes `eas.json` with:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"  // Creates installable APK
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"  // For Play Store
      }
    }
  }
}
```

**Preview build**: Test APK  
**Production build**: Play Store AAB

---

**Last Updated**: 2026-04-02  
**App Version**: 1.0.0  
**Build Method**: EAS Cloud Build
