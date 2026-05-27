#!/bin/bash

# AR Survey - APK Build Script
# This script automates the EAS build process

set -e  # Exit on error

echo "======================================"
echo "🚀 AR Survey APK Build Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}📦 EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI installed${NC}"
else
    echo -e "${GREEN}✅ EAS CLI found${NC}"
fi

echo ""
echo "======================================"
echo "Step 1: Installing Dependencies"
echo "======================================"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "======================================"
echo "Step 2: Checking EAS Authentication"
echo "======================================"

# Check if logged in
if eas whoami &> /dev/null; then
    echo -e "${GREEN}✅ Already logged in to Expo${NC}"
    eas whoami
else
    echo -e "${YELLOW}🔑 Please login to your Expo account${NC}"
    echo "If you don't have an account, create one at: https://expo.dev/signup"
    echo ""
    eas login
fi

echo ""
echo "======================================"
echo "Step 3: Configuring Project"
echo "======================================"

# Configure EAS if needed
if [ ! -f "eas.json" ]; then
    echo -e "${YELLOW}Configuring EAS for first time...${NC}"
    eas build:configure
fi
echo -e "${GREEN}✅ Project configured${NC}"

echo ""
echo "======================================"
echo "Step 4: Building APK"
echo "======================================"
echo -e "${YELLOW}⏳ Starting build... This will take ~10-15 minutes${NC}"
echo ""

eas build --platform android --profile preview

echo ""
echo "======================================"
echo "🎉 Build Submitted!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Wait for build to complete (~10-15 minutes)"
echo "2. Check your email for the download link"
echo "3. Or visit: https://expo.dev to see build status"
echo ""
echo "The APK will be ready to download once the build completes."
echo ""
