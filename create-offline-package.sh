#!/bin/bash

# AR Survey - Local Offline Setup Script
# Creates a complete offline package for home host testing

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     AR SURVEY - OFFLINE PACKAGE BUILDER                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PACKAGE_DIR="/tmp/ar-survey-offline"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="ar-survey-offline-${TIMESTAMP}"

echo -e "${BLUE}📦 Creating offline package...${NC}"
echo ""

# Clean and create package directory
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

echo -e "${YELLOW}1. Copying application files...${NC}"

# Copy frontend
mkdir -p "$PACKAGE_DIR/frontend"
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='build' \
  --exclude='.git' \
  --exclude='*.log' \
  /app/frontend/ "$PACKAGE_DIR/frontend/"

# Copy backend
mkdir -p "$PACKAGE_DIR/backend"
rsync -av --progress \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.git' \
  --exclude='*.log' \
  /app/backend/ "$PACKAGE_DIR/backend/"

echo -e "${GREEN}✅ Application files copied${NC}"
echo ""

echo -e "${YELLOW}2. Creating local configuration...${NC}"

# Create local .env for frontend
cat > "$PACKAGE_DIR/frontend/.env.local" << 'EOF'
# Local Development Environment
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_ENVIRONMENT=local
REACT_APP_OFFLINE_MODE=true
EOF

# Create local .env for backend
cat > "$PACKAGE_DIR/backend/.env.local" << 'EOF'
# Local Development Environment
MONGO_URL=mongodb://localhost:27017
DB_NAME=ar_survey_local
CORS_ORIGINS=["http://localhost:3000","http://localhost:8001"]
ENVIRONMENT=local
EOF

echo -e "${GREEN}✅ Local configuration created${NC}"
echo ""

echo -e "${YELLOW}3. Creating startup scripts...${NC}"

# Frontend start script
cat > "$PACKAGE_DIR/start-frontend.sh" << 'EOF'
#!/bin/bash
echo "Starting AR Survey Frontend (Offline Mode)..."
cd frontend
cp .env.local .env
yarn install
yarn start
EOF
chmod +x "$PACKAGE_DIR/start-frontend.sh"

# Backend start script
cat > "$PACKAGE_DIR/start-backend.sh" << 'EOF'
#!/bin/bash
echo "Starting AR Survey Backend (Local)..."
cd backend
cp .env.local .env
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
EOF
chmod +x "$PACKAGE_DIR/start-backend.sh"

# Combined start script
cat > "$PACKAGE_DIR/start-all.sh" << 'EOF'
#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        AR SURVEY - LOCAL OFFLINE TESTING                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if MongoDB is running
if ! pgrep -x mongod > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB not running${NC}"
    echo "Starting MongoDB..."
    mongod --dbpath ./data/db --fork --logpath ./data/mongodb.log
fi

echo -e "${GREEN}✅ MongoDB running${NC}"
echo ""

# Start backend in background
echo -e "${YELLOW}Starting Backend...${NC}"
./start-backend.sh &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to start
sleep 5

# Start frontend
echo -e "${YELLOW}Starting Frontend...${NC}"
./start-frontend.sh

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
EOF
chmod +x "$PACKAGE_DIR/start-all.sh"

# Windows batch file
cat > "$PACKAGE_DIR/start-all.bat" << 'EOF'
@echo off
echo ========================================
echo AR SURVEY - LOCAL OFFLINE TESTING
echo ========================================
echo.

echo Starting Backend...
start "AR Survey Backend" cmd /k "cd backend && pip install -r requirements.txt && uvicorn server:app --host 0.0.0.0 --port 8001"

timeout /t 5

echo Starting Frontend...
cd frontend
call yarn install
call yarn start

pause
EOF

echo -e "${GREEN}✅ Startup scripts created${NC}"
echo ""

echo -e "${YELLOW}4. Creating README and documentation...${NC}"

cat > "$PACKAGE_DIR/README.md" << 'EOF'
# AR Survey - Offline Local Testing Package

## 📦 What's Included

- Complete AR Survey application
- Local development configuration
- Offline mode enabled (except maps & Google sync)
- All features working locally

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- Node.js 18+ (https://nodejs.org)
- Python 3.9+ (https://python.org)
- MongoDB 6+ (https://www.mongodb.com/try/download/community)

**Optional:**
- Yarn (recommended) or npm

---

## 📋 Installation

### 1. Install Dependencies

**MongoDB:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
Download from: https://www.mongodb.com/try/download/community
```

**Node.js packages:**
```bash
cd frontend
yarn install
# or
npm install
```

**Python packages:**
```bash
cd backend
pip install -r requirements.txt
```

---

## 🎯 Running the App

### Option 1: All-in-One (Recommended)

**Mac/Linux:**
```bash
./start-all.sh
```

**Windows:**
```
start-all.bat
```

### Option 2: Manual Start

**Terminal 1 - MongoDB:**
```bash
mongod --dbpath ./data/db
```

**Terminal 2 - Backend:**
```bash
./start-backend.sh
```

**Terminal 3 - Frontend:**
```bash
./start-frontend.sh
```

---

## 🌐 Access the App

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:8001
**API Docs:** http://localhost:8001/docs

---

## 🔧 Configuration

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_ENVIRONMENT=local
REACT_APP_OFFLINE_MODE=true
```

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=ar_survey_local
CORS_ORIGINS=["http://localhost:3000"]
```

---

## 🌐 What Works Offline

✅ **Works Offline:**
- AR Camera view
- 3D Compass
- Pin dropping
- Distance measurements
- Trace recording
- KML export/import
- Local data storage
- Settings

⚠️ **Requires Internet:**
- **Map tiles** (ESRI satellite imagery)
- **Google OAuth** (sign-in feature)
- **Google Drive sync** (future feature)

**Note:** App works fully without internet except maps won't load tiles. Pin locations still work!

---

## 📱 Testing on Local Network

### Access from Other Devices

**1. Find your computer's IP:**
```bash
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

**2. Update frontend .env:**
```
REACT_APP_BACKEND_URL=http://YOUR_IP:8001
```

**3. Access from other devices:**
```
http://YOUR_IP:3000
```

**Example:**
```
Computer IP: 192.168.1.100
Phone browser: http://192.168.1.100:3000
```

---

## 🗄️ Data Storage

**Location:** MongoDB local database
**Database:** `ar_survey_local`
**Collections:**
- `users` - User accounts
- `pins` - Pin markers (when MongoDB integration complete)
- `traces` - Trace recordings
- `measurements` - Distance measurements

**Current:** Data stored in browser localStorage
**Future:** MongoDB backend (in development)

---

## 🧪 Testing Checklist

- [ ] Frontend loads at localhost:3000
- [ ] Backend API at localhost:8001/docs
- [ ] AR view opens (camera permission)
- [ ] Compass shows orientation
- [ ] Drop pins on map (map tiles load if online)
- [ ] Measure distance between points
- [ ] Record traces
- [ ] Export KML file
- [ ] Import KML file
- [ ] Settings save correctly
- [ ] Offline mode (disconnect internet, test features)

---

## 🚨 Troubleshooting

### "Port already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Kill process on port 8001
lsof -ti:8001 | xargs kill
```

### "MongoDB connection failed"
```bash
# Start MongoDB
mongod --dbpath ./data/db
```

### "Module not found"
```bash
# Frontend
cd frontend
yarn install

# Backend
cd backend
pip install -r requirements.txt
```

### Maps not loading
- **Cause:** No internet connection
- **Solution:** Map tiles require internet, but app still works
- **Offline use:** Pins and measurements work without map tiles

---

## 🔐 Security Notes

**For Local Testing Only:**
- No authentication required by default
- MongoDB without password (local only)
- CORS open to localhost

**For Production:**
- Use environment variables
- Enable MongoDB authentication
- Configure proper CORS
- Use HTTPS

---

## 📊 Performance

**Local vs Cloud:**
- ✅ Faster (no network latency)
- ✅ Works offline (except maps)
- ✅ Full control
- ⚠️ Single device only (unless network shared)
- ⚠️ No cloud backup

---

## 🔄 Updating

To get latest code:
1. Download new offline package
2. Copy your `data/` folder (MongoDB data)
3. Run new version

---

## 📝 Development

### Making Changes

**Frontend:**
```bash
cd frontend
# Edit files in src/
yarn start  # Hot reload enabled
```

**Backend:**
```bash
cd backend
# Edit server.py or other files
# Server auto-reloads
```

### Building for Production

**Frontend:**
```bash
cd frontend
yarn build
# Output: build/
```

**Backend:**
```bash
# Already production-ready
uvicorn server:app --host 0.0.0.0 --port 8001
```

---

## 🌐 Network Testing

### Test on Home Network

**1. Start on main computer:**
```bash
./start-all.sh
```

**2. Find IP address:**
```bash
ifconfig | grep "inet 192"
# Example output: inet 192.168.1.100
```

**3. Update backend .env:**
```
CORS_ORIGINS=["http://localhost:3000","http://192.168.1.100:3000"]
```

**4. Access from phone/tablet:**
```
http://192.168.1.100:3000
```

**5. Test features:**
- AR camera
- GPS tracking
- Pin dropping
- All features

---

## 📚 Additional Resources

- **MongoDB Docs:** https://docs.mongodb.com
- **React Docs:** https://react.dev
- **FastAPI Docs:** https://fastapi.tiangolo.com

---

## 🎉 Summary

**Package Contents:**
- ✅ Complete AR Survey app
- ✅ Local configuration
- ✅ Startup scripts
- ✅ Offline support (PWA)
- ✅ Documentation

**Run Command:**
```bash
./start-all.sh
```

**Access:**
```
http://localhost:3000
```

**Happy Testing!** 🚀
EOF

# Create data directory structure
mkdir -p "$PACKAGE_DIR/data/db"

# Create stop script
cat > "$PACKAGE_DIR/stop-all.sh" << 'EOF'
#!/bin/bash
echo "Stopping AR Survey..."
pkill -f "uvicorn server:app"
pkill -f "react-scripts start"
pkill -f mongod
echo "✅ All services stopped"
EOF
chmod +x "$PACKAGE_DIR/stop-all.sh"

echo -e "${GREEN}✅ Documentation created${NC}"
echo ""

echo -e "${YELLOW}5. Creating ZIP archive...${NC}"

cd /tmp
tar -czf "/app/${PACKAGE_NAME}.tar.gz" ar-survey-offline/

ZIP_SIZE=$(du -h "/app/${PACKAGE_NAME}.tar.gz" | cut -f1)

echo -e "${GREEN}✅ Package created${NC}"
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              OFFLINE PACKAGE COMPLETE                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Package: ${PACKAGE_NAME}.tar.gz"
echo "Size: $ZIP_SIZE"
echo "Location: /app/${PACKAGE_NAME}.tar.gz"
echo ""
echo "📦 Contents:"
echo "  • Complete AR Survey application"
echo "  • Local development setup"
echo "  • Offline mode enabled"
echo "  • Startup scripts (Mac/Linux/Windows)"
echo "  • Complete documentation"
echo ""
echo "🚀 To Use:"
echo "  1. Extract: tar -xzf ${PACKAGE_NAME}.tar.gz"
echo "  2. cd ar-survey-offline"
echo "  3. ./start-all.sh"
echo "  4. Open: http://localhost:3000"
echo ""
echo "📖 See README.md for detailed instructions"
echo ""
echo "✅ Ready for local home host testing!"
echo ""
