# 📱 Build APK - Quick Start

## 🚀 Three Ways to Build Your APK

---

## ✨ Method 1: One-Command Build (EASIEST)

I've created a fully automated script for you!

### On Mac/Linux:
```bash
cd react-native-ar-survey
./quick-build.sh
```

### On Windows:
```cmd
cd react-native-ar-survey
build-apk.bat
```

**The script will:**
1. ✅ Check Node.js installation
2. ✅ Install dependencies
3. ✅ Install EAS CLI
4. ✅ Prompt you to login to Expo
5. ✅ Start the build
6. ✅ Give you download link when done

**Time:** ~15-20 minutes total

---

## 📦 Method 2: Manual Commands (5 Steps)

If you prefer to run commands manually:

### Step 1: Navigate to project
```bash
cd react-native-ar-survey
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Install EAS CLI (one-time)
```bash
npm install -g eas-cli
```

### Step 4: Login to Expo
```bash
eas login
```
Create account at https://expo.dev/signup if needed

### Step 5: Build APK
```bash
eas build --platform android --profile preview
```

**Done!** Wait for email with download link (~15 mins)

---

## 🌐 Method 3: Expo Go (Instant Testing, No APK)

Want to test immediately without building APK?

### Step 1: Install Expo Go
- Download "Expo Go" from Google Play Store

### Step 2: Start dev server
```bash
cd react-native-ar-survey
npx expo start
```

### Step 3: Scan QR code
- Open Expo Go app
- Scan the QR code shown in terminal
- App loads instantly!

**No build time needed!** Perfect for testing.

---

## 📋 What You Need

### Required:
- ✅ Node.js 18+ (download: https://nodejs.org)
- ✅ Expo account (signup: https://expo.dev/signup)
- ✅ Internet connection

### NOT Required:
- ❌ Android Studio
- ❌ Java/JDK
- ❌ Gradle
- ❌ Android SDK

Everything builds in the cloud! ☁️

---

## ⏱️ Build Timeline

```
┌─────────────────────────────────────────────┐
│ Upload code to Expo         │ 2-3 mins     │
├─────────────────────────────────────────────┤
│ Cloud build process         │ 10-12 mins   │
├─────────────────────────────────────────────┤
│ Generate download link      │ 1 min        │
└─────────────────────────────────────────────┘
         Total: ~15 minutes
```

---

## 📥 After Build Completes

### You'll receive:
- ✅ Email notification with download link
- ✅ Build details at https://expo.dev
- ✅ Downloadable APK (~50-60 MB)

### Installation:
1. **Download APK** from link
2. **Transfer to Android device** (USB, email, Drive)
3. **Enable "Unknown sources"**
   - Settings → Security → Install unknown apps
   - Enable for browser/file manager
4. **Tap APK** to install
5. **Open "AR Survey"** app!

---

## 🎯 Current Setup

**Your React Native Project:**
- ✅ WebView app ready (wraps your PWA)
- ✅ All permissions configured
- ✅ Build scripts created
- ✅ EAS configured

**What's included in APK:**
- AR Camera view
- 3D Compass with calibration
- GPS tracking
- Map view with satellite tiles
- Pin dropping
- Distance measurements
- KML export
- Optional Google sign-in
- Offline support

---

## 🔧 Build Scripts Available

1. **`quick-build.sh`** (NEW!)
   - Fully automated
   - Checks everything
   - Guides you through process
   - **Recommended for first build**

2. **`build-apk.sh`**
   - Original script
   - Step-by-step with prompts

3. **`build-apk.bat`**
   - Windows version
   - Same as build-apk.sh

**Use whichever you prefer!**

---

## 🚨 Troubleshooting

### "Node.js not found"
```bash
# Install from: https://nodejs.org
# Or use nvm:
nvm install 18
nvm use 18
```

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Login failed"
- Go to https://expo.dev/signup
- Create free account
- Try `eas login` again

### "Build failed"
- Check build logs at expo.dev
- Verify app.json is valid JSON
- Run `npm install` again
- Try `eas build:list` to see status

### "APK won't install"
- Enable "Install unknown apps" on device
- Check Android version (need 6.0+)
- Try different file manager

---

## 💡 Pro Tips

### Faster builds:
- Use `preview` profile (APK, faster)
- `production` profile for Play Store (AAB, slower)

### Check build status:
```bash
eas build:list
```

### View build details:
- https://expo.dev/accounts/[your-username]/builds

### Cancel build:
```bash
eas build:cancel
```

### Test without APK:
- Use Expo Go app (instant)
- No build time
- Perfect for development

---

## 📞 Need Help?

### Quick fixes:
1. Try `npm install` again
2. Restart terminal
3. Check internet connection
4. Use Expo Go for instant testing

### Resources:
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Expo Dashboard: https://expo.dev

---

## 🎉 Ready to Build!

**Quickest path:**

```bash
cd react-native-ar-survey
./quick-build.sh
```

**That's it!** The script handles everything else.

In ~15 minutes, you'll have a downloadable APK! 🚀

---

**Files:**
- `/app/react-native-ar-survey/quick-build.sh` ← NEW!
- `/app/react-native-ar-survey/build-apk.sh`
- `/app/react-native-ar-survey/build-apk.bat`

**All ready to use!** ✨
