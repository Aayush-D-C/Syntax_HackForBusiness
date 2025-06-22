# Shopkeeper Business Management System

A comprehensive React Native Expo application with Node.js backend and Python AI services for shopkeeper business management, featuring credit scoring, inventory management, blockchain sales records, and predictive analytics.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Node.js       │    │   Python Flask  │
│   Expo App      │◄──►│   Backend       │◄──►│   AI Services   │
│   (Frontend)    │    │   (Port 3001)   │    │   (Port 5000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Camera        │    │   SQLite        │    │   Credit Score  │
│   Scanner       │    │   Database      │    │   Model         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📱 Features

### 🔐 Authentication
- Login/logout system
- Mock authentication (any username/password works)
- Session management

### 📊 Dashboard
- Business statistics overview
- Revenue tracking
- Inventory status
- Credit score display

### 🏪 Shopkeeper Management
- Add new shopkeepers
- Edit shopkeeper details
- View shopkeeper profiles
- Credit scoring integration

### 📦 Inventory Management
- Barcode scanning for product removal
- Manual product addition
- Stock tracking
- Product history

### 🔍 Credit Scoring
- CSV data upload and processing
- Dynamic credit score calculation
- Historical credit data
- Risk assessment

### 🔗 Blockchain Integration
- Sales record blockchain
- Immutable transaction history
- Block mining simulation
- Transaction verification

### 📈 Predictive Analytics
- Sales predictions
- Inventory forecasting
- Business insights

### 📷 Barcode Scanner
- Real-time product scanning
- Product removal workflow
- Visual scanning interface

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### 1. Install Dependencies

#### Frontend (React Native)
   ```bash
   npm install
   ```

#### Backend (Node.js)
```bash
cd backend
npm install
```

#### Python AI Services
```bash
cd Model
pip install -r requirements_simple.txt
```

### 2. Start All Services

#### Terminal 1: Python AI Services
```bash
cd Model
python credit_api_simple.py
```
**Expected Output:** `Running on http://127.0.0.1:5000`

#### Terminal 2: Node.js Backend
```bash
cd backend
npm start
```
**Expected Output:** `Server running on port 3001`

#### Terminal 3: React Native App
   ```bash
   npx expo start
   ```
**Expected Output:** Expo development server starts

### 3. Access the Application
- Scan QR code with Expo Go app (mobile)
- Press 'a' for Android emulator
- Press 'i' for iOS simulator

## 📁 Project Structure

```
Syntax_HackForBusiness/
├── app/                          # React Native screens
│   ├── (auth)/                   # Authentication screens
│   ├── (tabs)/                   # Main tab navigation
│   ├── assets/                   # Images and icons
│   └── welcome.tsx              # Welcome screen
├── backend/                      # Node.js backend
│   ├── server.js                # Main server file
│   ├── blockchain_service.js    # Blockchain implementation
│   ├── database.sqlite          # SQLite database
│   └── uploads/                 # File upload directory
├── Model/                       # Python AI services
│   ├── credit_api_simple.py     # Flask API for credit scoring
│   ├── credit_score.py          # Credit scoring logic
│   └── requirements_simple.txt  # Python dependencies
├── blockchain/                  # Blockchain implementation
│   └── SalesRecord.py           # Blockchain sales records
├── context/                     # React Context providers
│   ├── AuthContext.tsx          # Authentication state
│   ├── DataContext.tsx          # Data management
│   └── ScanContext.tsx          # Scanner state
├── services/                    # API services
│   └── apiService.ts            # HTTP client
└── package.json                 # Frontend dependencies
```

## 🔧 Configuration

### API Endpoints

#### Backend (Node.js - Port 3001)
- `GET /api/shopkeepers` - Get all shopkeepers
- `POST /api/shopkeepers` - Add new shopkeeper
- `PUT /api/shopkeepers/:id` - Update shopkeeper
- `DELETE /api/shopkeepers/:id` - Delete shopkeeper
- `GET /api/dashboard/stats` - Get dashboard statistics
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/upload/csv` - Upload CSV for credit scoring
- `GET /api/credit-scores` - Get credit scores
- `POST /api/blockchain/add-record` - Add blockchain record
- `GET /api/blockchain/records` - Get blockchain records

#### Python AI Services (Port 5000)
- `POST /calculate_credit_score` - Calculate credit score
- `GET /health` - Health check

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=3001
PYTHON_API_URL=http://192.168.78.234:5000
```

## 📖 Usage Guide

### 1. Authentication
- Open the app
- Use any username and password (mock authentication)
- You'll be redirected to the main dashboard

### 2. Dashboard
- View business statistics
- Monitor inventory levels
- Check credit scores
- Access quick actions

### 3. Inventory Management

#### Adding Products
1. Go to **Stocks** tab
2. Tap **Add Item** button
3. Enter product details:
   - Product name
   - Barcode (optional)
   - Quantity
   - Price
4. Tap **Add Product**

#### Removing Products (Scanning)
1. Go to **Scanner** tab
2. Point camera at product barcode
3. Product will be automatically removed from inventory
4. View confirmation message

### 4. Credit Scoring
1. Go to **Credit Score** tab
2. Upload CSV file with shopkeeper data
3. System processes data and calculates credit scores
4. View results and risk assessment

### 5. Blockchain Records
1. Go to **Blockchain** tab
2. View all sales records
3. Each record is stored in immutable blockchain
4. Verify transaction integrity

### 6. Shopkeeper Management
1. Go to **Shopkeepers** tab
2. View all shopkeepers
3. Tap on shopkeeper to edit details
4. Add new shopkeepers as needed

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill processes on specific ports
netstat -ano | findstr :3001
taskkill /PID <PID> /F

netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### 2. Network Request Failed
- Ensure backend is running on port 3001
- Ensure Python API is running on port 5000
- Check firewall settings
- Verify 192.168.78.234 connectivity

#### 3. Python Dependencies Issues
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install Visual Studio Build Tools (Windows)
# Download from: https://visualstudio.microsoft.com/downloads/

# Reinstall requirements
pip install -r requirements_simple.txt
```

#### 4. Expo Connection Issues
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache
```

### Testing Connections

#### Test Backend
```bash
curl http://192.168.78.234:3001/api/shopkeepers
```

#### Test Python API
```bash
curl http://192.168.78.234:5000/health
```

#### Test Blockchain
```bash
node test_blockchain.js
```

## 🛠️ Development

### Adding New Features

#### 1. New API Endpoint
1. Add route in `backend/server.js`
2. Update `services/apiService.ts`
3. Create corresponding screen in `app/`

#### 2. New Screen
1. Create file in `app/` directory
2. Add to navigation in `app/_layout.tsx`
3. Update tab navigation if needed

#### 3. New Context
1. Create context file in `context/`
2. Wrap app with provider in `app/_layout.tsx`
3. Use context in components

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

## 📊 Data Models

### Shopkeeper
```typescript
interface Shopkeeper {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  creditScore: number;
  joinDate: string;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  barcode: string;
  quantity: number;
  price: number;
  addedDate: string;
}
```

### Credit Score
```typescript
interface CreditScore {
  shopkeeperId: string;
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  factors: string[];
  calculatedDate: string;
}
```

### Blockchain Record
```typescript
interface SalesRecord {
  id: string;
  shopkeeperId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  timestamp: string;
  blockHash: string;
}
```

## 🔒 Security Considerations

### Current Implementation
- Mock authentication (development only)
- Basic input validation
- SQLite database (local storage)

### Production Recommendations
- Implement proper JWT authentication
- Add input sanitization
- Use environment variables for secrets
- Implement rate limiting
- Add HTTPS encryption
- Use production database (PostgreSQL/MySQL)

## 🚀 Deployment

### Backend Deployment
1. Set up production server
2. Install Node.js and dependencies
3. Configure environment variables
4. Use PM2 for process management
5. Set up reverse proxy (Nginx)

### Frontend Deployment
1. Build production APK/IPA
2. Use EAS Build for Expo
3. Configure app signing
4. Upload to app stores

### Python API Deployment
1. Deploy to cloud platform (Heroku/AWS)
2. Use Gunicorn for production
3. Configure environment variables
4. Set up monitoring

## 📞 Support

### Getting Help
1. Check this documentation
2. Review error logs
3. Test individual components
4. Verify network connectivity
5. Restart all services

### Common Commands
```bash
# Start all services
cd Model && python credit_api_simple.py &
cd backend && npm start &
npx expo start

# Stop all services
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Clear all caches
npx expo start --clear
npm cache clean --force
```

## 📝 License

This project is developed for hackathon and business purposes. Please ensure compliance with local regulations and data protection laws.

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Maintainer:** Team Synatx
