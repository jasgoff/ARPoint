# 🚀 Build APK Without Expo

## ✅ Solution: Use Capacitor

Convert your existing PWA directly to native Android - **no Expo needed!**

---

## 📦 Method: Capacitor (Recommended)

**What is Capacitor?**
- Converts your React PWA to native Android
- Uses your existing code
- No Expo account needed
- Works with Android Studio

---

## 🎯 Quick Build (Automated Script)

I've created a script that does everything:

```bash
cd /app
./build-apk-no-expo.sh
```

**The script will:**
1. ✅ Install Capacitor
2. ✅ Build your React app
3. ✅ Add Android platform
4. ✅ Sync files
5. ✅ Give you 2 build options

**Time:** ~10 minutes (first time)

---

## 📋 Manual Steps (If You Prefer)

### Step 1: Install Capacitor
```bash
cd frontend
yarn add @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor
```bash
npx cap init "AR Survey" "com.arsurvey.app" --web-dir=build
```

### Step 3: Build React App
```bash
yarn build
```

### Step 4: Add Android Platform
```bash
npx cap add android
```

### Step 5: Sync Files
```bash
npx cap sync android
```

### Step 6: Build APK

**Option A: Android Studio (Recommended)**
```bash
npx cap open android
```
Then in Android Studio:
- Build → Build APK(s)
- APK appears in: `android/app/build/outputs/apk/debug/`

**Option B: Command Line**
```bash
cd android
./gradlew assembleDebug
```
APK at: `app/build/outputs/apk/debug/app-debug.apk`

---

## ⚙️ Configuration Files Created

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arsurvey.app',
  appName: 'AR Survey',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
```

### AndroidManifest.xml (auto-generated)
Permissions added:
- Camera
- GPS/Location
- Internet
- Storage

---

## 🆚 Capacitor vs Expo

| Feature | Capacitor | Expo |
|---------|-----------|------|
| Account needed | ❌ No | ✅ Yes |
| Cloud build | ❌ No | ✅ Yes |
| Build time | ~5 mins | ~15 mins |
| APK size | ~30 MB | ~50 MB |
| Local build | ✅ Yes | ❌ No |
| Android Studio | ✅ Uses it | ❌ Cloud only |

**Capacitor = Local control, no account needed**

---

## 📱 Requirements

### Must Have:
- ✅ Node.js 16+
- ✅ Yarn or npm

### For Building:
**Option A: Android Studio** (Easiest)
- Download: https://developer.android.com/studio
- Includes everything needed

**Option B: Command Line**
- Android SDK
- Java JDK 17
- Gradle

---

## 🚀 Recommended Workflow

### First Time (Setup):
```bash
cd /app
./build-apk-no-expo.sh
```
**Choose Option A** (Android Studio)

### Subsequent Builds:
```bash
cd frontend
yarn build
npx cap sync android
npx cap open android
```
Then build in Android Studio

---

## 📦 Build Output

**Debug APK:**
- Location: `frontend/android/app/build/outputs/apk/debug/`
- Size: ~30-40 MB
- Installable immediately

**Release APK (for production):**
```bash
cd frontend/android
./gradlew assembleRelease
```
- Location: `app/build/outputs/apk/release/`
- Size: ~25-30 MB (optimized)
- Needs signing key

---

## 🔐 Signing APK (For Play Store)

### Generate keystore:
```bash
keytool -genkey -v -keystore ar-survey.keystore \
  -alias ar-survey -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Gradle:
Edit `frontend/android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../ar-survey.keystore")
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

### Build signed APK:
```bash
./gradlew assembleRelease
```

---

## 🎨 Customizing Native App

### App Icon:
Place icons in:
```
frontend/android/app/src/main/res/
  └─ mipmap-*/ (various sizes)
```

### Splash Screen:
Edit: `frontend/android/app/src/main/res/drawable/splash.xml`

### App Name:
Edit: `frontend/android/app/src/main/res/values/strings.xml`
```xml
<string name="app_name">AR Survey</string>
```

---

## 🔧 Updating the App

After code changes:

```bash
cd frontend
yarn build
npx cap sync android
```

Then rebuild in Android Studio or:
```bash
cd android
./gradlew assembleDebug
```

---

## 📊 Comparison: All Build Methods

| Method | Account | Time | Control | Size |
|--------|---------|------|---------|------|
| **Capacitor** | ❌ | 5 min | ✅ Full | 30 MB |
| **Expo EAS** | ✅ | 15 min | ❌ Limited | 50 MB |
| **React Native CLI** | ❌ | 10 min | ✅ Full | 35 MB |

**Recommendation: Capacitor** (easiest for PWA conversion)

---

## 🚨 Troubleshooting

### "Android SDK not found"
**Solution:** Install Android Studio, it includes SDK

### "JAVA_HOME not set"
```bash
export JAVA_HOME=/path/to/java
export PATH=$JAVA_HOME/bin:$PATH
```

### "Gradle build failed"
- Open project in Android Studio
- Let it sync/download dependencies
- Build from Studio menu

### "Command not found: cap"
```bash
yarn add @capacitor/cli
```

---

## 🎯 Quick Commands Reference

```bash
# Setup (once)
cd frontend
yarn add @capacitor/core @capacitor/cli @capacitor/android
npx cap init "AR Survey" "com.arsurvey.app" --web-dir=build
npx cap add android

# Build (every time)
yarn build
npx cap sync android
npx cap open android

# Or command line build
cd android
./gradlew assembleDebug
```

---

## 📱 Testing the APK

### On Emulator:
```bash
cd frontend/android
./gradlew installDebug
```

### On Real Device:
```bash
adb install app-debug.apk
```

Or transfer APK and install manually.

---

## 🎉 Summary

**No Expo Needed!**

**Quick Build:**
```bash
./build-apk-no-expo.sh
```

**Manual Build:**
```bash
cd frontend
yarn build
npx cap sync android
npx cap open android
# Then: Build → Build APK
```

**Result:** APK in 5-10 minutes! 🚀

---

## 📖 Resources

- **Capacitor Docs**: https://capacitorjs.com
- **Android Studio**: https://developer.android.com/studio
- **Build Guide**: https://capacitorjs.com/docs/android

---

**Files Created:**
- `/app/build-apk-no-expo.sh` - Automated build script
- `/app/BUILD_WITHOUT_EXPO.md` - This guide

**Ready to build!** No Expo account needed! ✨
