#!/bin/bash

# AR Survey - Create Downloadable ZIP

echo "======================================"
echo "📦 Creating Downloadable ZIP"
echo "======================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create temp directory for clean package
TEMP_DIR="/tmp/ar-survey-package"
ZIP_NAME="ar-survey-complete-$(date +%Y%m%d-%H%M%S).zip"

echo -e "${YELLOW}📂 Preparing files...${NC}"

# Remove old temp if exists
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy project files (excluding node_modules, build, etc.)
echo -e "${YELLOW}📋 Copying project files...${NC}"

rsync -av \
  --exclude='node_modules' \
  --exclude='build' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='.emergent' \
  /app/ "$TEMP_DIR/"

echo -e "${GREEN}✅ Files copied${NC}"

# Create README for the package
cat > "$TEMP_DIR/README_FIRST.txt" << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║           AR SURVEY - COMPLETE PROJECT PACKAGE            ║
╚═══════════════════════════════════════════════════════════╝

📦 What's Included:
  - Complete React PWA frontend
  - FastAPI backend
  - React Native mobile app
  - All documentation
  - Build scripts

🚀 Quick Start:

1. Frontend (PWA):
   cd frontend
   yarn install
   yarn start

2. Backend:
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload

3. Mobile APK:
   cd react-native-ar-survey
   ./build-apk.sh

📖 Documentation:
  - README.md - Main project overview
  - BUILD_APK_NOW.md - APK build instructions
  - COMPASS_FIX_DOCUMENTATION.md - Compass details
  - All guides in /react-native-ar-survey/

🌐 Online Resources:
  - Expo: https://docs.expo.dev
  - React: https://react.dev
  - FastAPI: https://fastapi.tiangolo.com

Need help? Check the documentation files included!

╔═══════════════════════════════════════════════════════════╗
║                    Made with Emergent AI                  ║
╚═══════════════════════════════════════════════════════════╝
EOF

echo ""
echo -e "${YELLOW}🗜️  Creating ZIP archive...${NC}"

# Create ZIP
cd /tmp
zip -r "/app/$ZIP_NAME" ar-survey-package/ -q

# Get size
SIZE=$(du -h "/app/$ZIP_NAME" | cut -f1)

echo -e "${GREEN}✅ ZIP created successfully!${NC}"
echo ""
echo "======================================"
echo "📦 Package Details"
echo "======================================"
echo "File: $ZIP_NAME"
echo "Size: $SIZE"
echo "Location: /app/$ZIP_NAME"
echo ""
echo "🎉 Ready to download!"
echo ""

# Cleanup
rm -rf "$TEMP_DIR"
