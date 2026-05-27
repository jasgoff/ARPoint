#!/bin/bash

# AR Survey - Build APK Without Expo (Using Capacitor)
# This converts your PWA to a native Android app

echo "╔═══════════════════════════════════════════════════════╗"
echo "║     AR SURVEY - APK BUILD (NO EXPO REQUIRED)         ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📱 Building APK using Capacitor (No Expo needed)${NC}"
echo ""

# Check Node version
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Install from: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"

# Navigate to frontend
cd /app/frontend || exit 1

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 1: Installing Capacitor"
echo "═══════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}📦 Installing Capacitor packages...${NC}"
yarn add @capacitor/core @capacitor/cli @capacitor/android

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 2: Initializing Capacitor"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if capacitor.config.ts exists
if [ ! -f "capacitor.config.ts" ]; then
    echo -e "${YELLOW}⚙️  Initializing Capacitor...${NC}"
    npx cap init "AR Survey" "com.arsurvey.app" --web-dir=build
else
    echo -e "${GREEN}✅ Capacitor already initialized${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 3: Building React App"
echo "═══════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}🔨 Building production React app...${NC}"
yarn build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ React app built successfully${NC}"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 4: Adding Android Platform"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ ! -d "android" ]; then
    echo -e "${YELLOW}📱 Adding Android platform...${NC}"
    npx cap add android
else
    echo -e "${GREEN}✅ Android platform exists${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 5: Syncing Files"
echo "═══════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}🔄 Syncing web files to Android...${NC}"
npx cap sync android

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 6: Build Options"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "Choose build method:"
echo ""
echo "A) Open in Android Studio (Manual build - RECOMMENDED)"
echo "   - Better control"
echo "   - See build progress"
echo "   - Debug options"
echo ""
echo "B) Build via Gradle CLI (Automatic)"
echo "   - Requires Android SDK installed"
echo "   - Command-line build"
echo ""

read -p "Enter choice (A/B): " CHOICE

if [[ "$CHOICE" =~ ^[Aa]$ ]]; then
    echo ""
    echo -e "${BLUE}📱 Opening Android Studio...${NC}"
    npx cap open android
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "IN ANDROID STUDIO:"
    echo "═══════════════════════════════════════════════════════"
    echo "1. Wait for Gradle sync to complete"
    echo "2. Click: Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "3. Wait for build (~5 minutes)"
    echo "4. APK location: android/app/build/outputs/apk/debug/"
    echo ""
    
elif [[ "$CHOICE" =~ ^[Bb]$ ]]; then
    echo ""
    echo -e "${YELLOW}🔨 Building APK via Gradle...${NC}"
    
    cd android
    
    if [ ! -f "gradlew" ]; then
        echo -e "${RED}❌ Gradle wrapper not found${NC}"
        exit 1
    fi
    
    chmod +x gradlew
    ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
        
        if [ -f "$APK_PATH" ]; then
            APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
            
            echo ""
            echo "═══════════════════════════════════════════════════════"
            echo -e "${GREEN}🎉 APK BUILT SUCCESSFULLY!${NC}"
            echo "═══════════════════════════════════════════════════════"
            echo ""
            echo "APK Location:"
            echo "  $(pwd)/$APK_PATH"
            echo ""
            echo "APK Size: $APK_SIZE"
            echo ""
            echo "To install:"
            echo "  1. Transfer APK to Android device"
            echo "  2. Enable 'Unknown sources' in Settings"
            echo "  3. Tap APK to install"
            echo ""
        else
            echo -e "${RED}❌ APK file not found${NC}"
        fi
    else
        echo -e "${RED}❌ Gradle build failed${NC}"
        echo ""
        echo "Try option A (Android Studio) instead"
    fi
else
    echo "Invalid choice"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ DONE!"
echo "═══════════════════════════════════════════════════════"
