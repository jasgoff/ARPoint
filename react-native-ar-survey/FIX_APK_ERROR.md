# 🔧 Fix "Invalid UUID appId" Error

## ❌ The Error You Got:
```
Invalid UUID appId
Request ID: 6d443968-088d-47a5-ac7d-a42fa75729dc
Error: GraphQL request failed.
```

## ✅ The Solution:

The project needs to be configured with EAS first. Run this **ONE command**:

```bash
eas build:configure
```

This will:
1. Link your project to your Expo account
2. Generate a proper project ID
3. Update app.json automatically

Then try building again:
```bash
eas build --platform android --profile preview
```

---

## 📋 Full Fix Steps

### 1. Navigate to project:
```bash
cd react-native-ar-survey
```

### 2. Make sure you're logged in:
```bash
eas whoami
```

If not logged in:
```bash
eas login
```

### 3. Configure the project (THIS FIXES THE ERROR):
```bash
eas build:configure
```

**Press Enter** when prompted to accept defaults.

### 4. Build APK:
```bash
eas build --platform android --profile preview
```

**Done!** Build will start successfully! 🎉

---

## 🎯 What Happened?

The `app.json` file had a placeholder project ID:
```json
"projectId": "your-project-id"
```

Running `eas build:configure` replaces it with your actual project ID from Expo.

---

## ⚡ Quick Fix (Copy-Paste):

```bash
cd react-native-ar-survey
eas login
eas build:configure
eas build --platform android --profile preview
```

That's it! 🚀

---

## 🔍 Still Getting Errors?

### Error: "Not logged in"
```bash
eas login
```

### Error: "eas: command not found"
```bash
npm install -g eas-cli
```

### Error: "Project not found"
```bash
# Delete the projectId line from app.json, then:
eas build:configure
```

---

## 📖 What Each Command Does

| Command | What It Does |
|---------|--------------|
| `eas login` | Connects to your Expo account |
| `eas build:configure` | Links project to your account ⭐ |
| `eas build --platform android` | Builds the APK |

**`eas build:configure` is the key!** It fixes the "Invalid UUID" error.

---

## 🎉 After Fix

Once you run `eas build:configure`, you'll see:
```
✔ Generated Expo configuration
✔ Created "eas.json"
✔ Updated app.json with project ID
```

Then build normally:
```bash
eas build --platform android --profile preview
```

**Build will succeed!** ✅

---

**Quick answer:** Run `eas build:configure` first! 🔧
