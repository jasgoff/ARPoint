#!/bin/bash

# AR Survey - Quick APK Build
# Run this script to build your Android APK

echo "╔═══════════════════════════════════════════════════════╗"
echo "║         AR SURVEY - APK BUILD ASSISTANT              ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📱 This script will help you build an Android APK${NC}"
echo ""
echo "Prerequisites:"
echo "  • Node.js installed (v18 or higher)"
echo "  • Expo account (free at expo.dev/signup)"
echo ""

# Check Node version
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js version is $NODE_VERSION (recommended: 18+)${NC}"
fi

echo -e "${GREEN}✅ Node.js found: $(node -v)${NC}"
echo ""

# Navigate to React Native project
if [ ! -d "react-native-ar-survey" ]; then
    echo -e "${RED}❌ react-native-ar-survey folder not found${NC}"
    echo "Make sure you're in the project root directory"
    exit 1
fi

cd react-native-ar-survey

echo "═══════════════════════════════════════════════════════"
echo "STEP 1: Installing Dependencies"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies (this may take a few minutes)...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 2: Installing EAS CLI"
echo "═══════════════════════════════════════════════════════"
echo ""

if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}📦 Installing EAS CLI globally...${NC}"
    npm install -g eas-cli
else
    echo -e "${GREEN}✅ EAS CLI already installed: $(eas --version)${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 3: Login to Expo"
echo "═══════════════════════════════════════════════════════"
echo ""

if eas whoami &> /dev/null; then
    EXPO_USER=$(eas whoami)
    echo -e "${GREEN}✅ Already logged in as: $EXPO_USER${NC}"
else
    echo -e "${YELLOW}🔑 Please login to your Expo account${NC}"
    echo "Don't have an account? Create one at: https://expo.dev/signup"
    echo ""
    eas login
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Login failed${NC}"
        exit 1
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 4: Building APK"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}ℹ️  Build Information:${NC}"
echo "  • Platform: Android"
echo "  • Type: APK (installable)"
echo "  • Build Time: ~10-15 minutes"
echo "  • Build Location: Cloud (Expo servers)"
echo ""
echo -e "${YELLOW}⏳ Starting build... Please wait...${NC}"
echo ""

eas build --platform android --profile preview

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo -e "${GREEN}🎉 BUILD SUBMITTED SUCCESSFULLY!${NC}"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "What happens next:"
    echo "  1. Build runs on Expo's cloud servers (~10-15 mins)"
    echo "  2. You'll receive an email with download link"
    echo "  3. Download the APK file"
    echo "  4. Transfer to Android device"
    echo "  5. Install and test!"
    echo ""
    echo "Check build status:"
    echo "  • Dashboard: https://expo.dev"
    echo "  • Command: eas build:list"
    echo ""
    echo -e "${BLUE}📱 Installation Instructions:${NC}"
    echo "  1. On Android: Settings → Security → Install unknown apps"
    echo "  2. Enable for your file manager/browser"
    echo "  3. Tap the APK file to install"
    echo ""
else
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo -e "${RED}❌ BUILD FAILED${NC}"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Common issues:"
    echo "  1. Not logged in → Run: eas login"
    echo "  2. Invalid app.json → Check for JSON syntax errors"
    echo "  3. Network issues → Try again"
    echo ""
    echo "Get help:"
    echo "  • Check: https://expo.dev/accounts/[your-account]/builds"
    echo "  • Docs: https://docs.expo.dev/build/introduction/"
    exit 1
fi
