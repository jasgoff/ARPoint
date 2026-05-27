# 🚀 BUILD APK - Instructions

Since I'm running in a cloud environment without access to your Expo account, you'll need to run the build on your local machine. I've prepared everything you need!

## 📦 Option 1: One-Click Build Scripts (EASIEST)

I've created automated build scripts for you:

### On Mac/Linux:
```bash
cd /path/to/react-native-ar-survey
./build-apk.sh
```

### On Windows:
```cmd
cd C:\path\to\react-native-ar-survey
build-apk.bat
```

The script will:
1. ✅ Install EAS CLI (if needed)
2. ✅ Install dependencies
3. ✅ Prompt you to login to Expo
4. ✅ Configure the project
5. ✅ Start the build
6. ✅ Give you a download link when done

**Time: ~15-20 minutes total**

---

## 📦 Option 2: Manual Commands

If you prefer to run commands manually:

```bash
# 1. Navigate to project
cd /path/to/react-native-ar-survey

# 2. Install EAS CLI (if not already installed)
npm install -g eas-cli

# 3. Login to Expo
eas login
# (Create free account at expo.dev if you don't have one)

# 4. Install dependencies
npm install

# 5. Build APK
eas build --platform android --profile preview
```

---

## 📦 Option 3: Download and Build Locally

### Step 1: Download the Project

Download the entire `/app/react-native-ar-survey` folder to your computer.

You can:
- Export the code using the platform's export feature
- Clone the repository if it's on GitHub
- Copy the folder manually

### Step 2: Navigate to the Folder
```bash
cd /path/to/react-native-ar-survey
```

### Step 3: Run the Build Script
```bash
# Mac/Linux
./build-apk.sh

# Windows
build-apk.bat
```

---

## 🎯 What Happens During Build

1. **Authentication** (1 minute)
   - You'll be prompted to login to Expo
   - Create a free account at https://expo.dev/signup if needed

2. **Project Upload** (2-3 minutes)
   - Your code is uploaded to Expo's build servers
   - You'll see a progress bar

3. **Cloud Build** (10-15 minutes)
   - Expo builds your APK in the cloud
   - You can close the terminal and check status at expo.dev

4. **Download** (immediate)
   - You'll receive an email with the download link
   - Or get the link from: https://expo.dev/accounts/[your-account]/projects/ar-survey-mobile/builds

---

## 📲 After Build Completes

### You'll Get:
- ✅ Email notification with download link
- ✅ Downloadable APK file (~50-60 MB)
- ✅ Build details at expo.dev dashboard

### Install on Android:
1. Download APK from the link
2. Transfer to your Android device
3. Enable "Install unknown apps" in Settings
4. Tap APK to install
5. Open "AR Survey" app and test!

---

## 🔧 Build Files Included

I've created these scripts for you:

1. **`build-apk.sh`** (Mac/Linux)
   - Bash script with color output
   - Automated checks and error handling
   - Progress indicators

2. **`build-apk.bat`** (Windows)
   - Windows batch script
   - Same functionality as bash script
   - Works in CMD or PowerShell

3. **`App.webview.js`**
   - WebView wrapper ready to use
   - Points to your PWA
   - All permissions configured

---

## 🆓 Free Build Credits

**Expo Free Tier:**
- 30 builds per month
- Unlimited downloads
- No credit card required
- Keep all your build history

---

## 🚨 Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Login failed"
- Go to https://expo.dev/signup
- Create a free account
- Try `eas login` again

### "Build failed"
- Check build logs at expo.dev
- Ensure `app.json` is valid
- Run `npm install` again

### Permission denied (Mac/Linux)
```bash
chmod +x build-apk.sh
```

---

## 📞 Need the Files?

All build files are in `/app/react-native-ar-survey/`:

```
react-native-ar-survey/
├── build-apk.sh          ← Mac/Linux script
├── build-apk.bat         ← Windows script
├── App.webview.js        ← WebView app
├── app.json              ← Configuration
├── eas.json              ← Build config
└── package.json          ← Dependencies
```

---

## 🎉 Summary

**To build your APK:**

1. Download `/app/react-native-ar-survey` folder
2. Run `./build-apk.sh` (Mac/Linux) or `build-apk.bat` (Windows)
3. Login to Expo when prompted
4. Wait ~15 minutes
5. Download APK from the link
6. Install on Android device!

**That's it!** The scripts handle everything automatically. 🚀

---

*Questions? Check the detailed guides:*
- `QUICK_APK_BUILD.md` - Quick reference
- `BUILD_INSTRUCTIONS.md` - Step-by-step guide
- `BUILD_APK_GUIDE.md` - Complete documentation
