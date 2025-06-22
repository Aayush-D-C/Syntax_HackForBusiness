# Complete Setup Guide

## 🚀 Step-by-Step Setup Instructions

### Prerequisites Check

Before starting, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   ```bash
   node --version
   npm --version
   ```

2. **Python** (v3.8 or higher)
   ```bash
   python --version
   pip --version
   ```

3. **Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

4. **Git** (for version control)
   ```bash
   git --version
   ```

### Step 1: Clone and Setup Project

```bash
# Navigate to your project directory
cd Syntax_HackForBusiness

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install Python dependencies
cd Model
pip install -r requirements_simple.txt
cd ..
```

### Step 2: Start All Services

You'll need **3 separate terminal windows** to run all services simultaneously.

#### Terminal 1: Python AI Services
```bash
cd Model
python credit_api_simple.py
```

**Expected Output:**
```
 * Serving Flask app 'credit_api_simple'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

#### Terminal 2: Node.js Backend
```bash
cd backend
npm start
```

**Expected Output:**
```
Server running on port 3001
Database initialized
Blockchain service started
```

#### Terminal 3: React Native App
```bash
npx expo start
```

**Expected Output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

### Step 3: Access the Application

#### Option A: Mobile Device (Recommended)
1. Install **Expo Go** app from App Store/Google Play
2. Scan the QR code displayed in Terminal 3
3. App will load on your device

#### Option B: Android Emulator
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Start emulator
4. Press `a` in Terminal 3

#### Option C: iOS Simulator (macOS only)
1. Install Xcode
2. Press `i` in Terminal 3

### Step 4: Test the System

#### 1. Login Test
- Open the app
- Use any username and password
- Should redirect to dashboard

#### 2. Backend Connection Test
```bash
curl http://localhost:3001/api/shopkeepers
```

#### 3. Python API Test
```bash
curl http://localhost:5000/health
```

#### 4. Blockchain Test
```bash
node test_blockchain.js
```

## 🔧 Troubleshooting Common Issues

### Issue 1: Port Already in Use

**Symptoms:** "Address already in use" or "EADDRINUSE"

**Solution:**
```bash
# Find processes using ports
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill the processes
taskkill /PID <PID_NUMBER> /F
```

### Issue 2: Python Dependencies Installation Failed

**Symptoms:** "Microsoft Visual C++ 14.0 is required" or pandas build errors

**Solution:**
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
# Install "C++ build tools" workload

# Try alternative installation
pip install --only-binary=all pandas
pip install -r requirements_simple.txt
```

### Issue 3: Network Request Failed

**Symptoms:** App shows "Network request failed" in logs

**Solution:**
1. Verify all services are running
2. Check firewall settings
3. Ensure correct ports (3001, 5000)
4. Test with curl commands above

### Issue 4: Expo Connection Issues

**Symptoms:** Can't connect to Expo development server

**Solution:**
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Check network connectivity
ping 192.168.x.x
```

### Issue 5: Database Errors

**Symptoms:** "SQLite database locked" or database errors

**Solution:**
```bash
# Stop all services
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Delete database file (will recreate)
cd backend
del database.sqlite

# Restart services
```

## 📱 App Usage After Setup

### 1. First Time Setup
1. Open app
2. Login with any credentials
3. Navigate through tabs to explore features

### 2. Add Test Data
1. Go to **Stocks** tab
2. Tap **Add Item**
3. Add a test product with barcode
4. Go to **Shopkeepers** tab
5. Add a test shopkeeper

### 3. Test Scanning
1. Go to **Scanner** tab
2. Point camera at the barcode you added
3. Product should be removed from inventory

### 4. Test Credit Scoring
1. Go to **Credit Score** tab
2. Upload the sample CSV file
3. View calculated credit scores

### 5. Test Blockchain
1. Go to **Blockchain** tab
2. View sales records
3. Add new records through inventory operations

## 🔄 Daily Startup Routine

### Quick Start Commands
```bash
# Terminal 1: Python API
cd Model && python credit_api_simple.py

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Frontend
npx expo start
```

### Shutdown Commands
```bash
# Stop all services
taskkill /F /IM node.exe
taskkill /F /IM python.exe
```

## 📊 Monitoring and Logs

### Backend Logs
- Check Terminal 2 for API requests
- Look for error messages
- Monitor database operations

### Python API Logs
- Check Terminal 1 for credit scoring requests
- Monitor CSV processing
- Watch for calculation errors

### Frontend Logs
- Check Terminal 3 for build errors
- Monitor network requests
- Watch for JavaScript errors

### App Logs
- Use Expo DevTools for debugging
- Check console logs in browser
- Monitor network tab for API calls

## 🛠️ Development Workflow

### Making Changes
1. Edit code files
2. Save changes
3. App will auto-reload (hot reload)
4. Test functionality

### Adding New Features
1. Update backend API (if needed)
2. Update frontend components
3. Test integration
4. Update documentation

### Debugging
1. Check terminal logs
2. Use browser developer tools
3. Test individual components
4. Verify API endpoints

## 📞 Getting Help

### When Things Don't Work
1. Check this setup guide
2. Verify all prerequisites
3. Test individual services
4. Check network connectivity
5. Review error logs
6. Restart all services

### Useful Commands
```bash
# Check what's running
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill all Node.js processes
taskkill /F /IM node.exe

# Kill all Python processes
taskkill /F /IM python.exe

# Clear all caches
npx expo start --clear
npm cache clean --force
```

---

**Remember:** Always start services in the correct order:
1. Python API (Terminal 1)
2. Node.js Backend (Terminal 2)
3. React Native App (Terminal 3) 