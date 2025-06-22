# BizSathi - Shopkeeper Business Management System

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
- Login/logout system with JWT tokens
- Mock authentication (any username/password works)
- Session management with AsyncStorage
- Auto-login with token persistence

### 📊 Dashboard
- **Dynamic Credit Score**: Real-time calculation based on business performance
- **Inventory Value**: Live stock valuation with profit margins
- **Today's Activity**: Daily operations summary
- **AI Predictions**: Next month profit/revenue forecasts
- **Low Stock Alerts**: Automatic notifications for low inventory
- **Weekly Trends**: Credit score progression over 7 days

### 🏪 Shopkeeper Management
- Add new shopkeepers with business details
- Edit shopkeeper information
- View shopkeeper profiles and credit history
- Credit scoring integration with risk assessment

### 📦 Inventory Management
- **Barcode Scanning**: Add/remove products with camera
- **Manual Entry**: Add products with detailed information
- **Stock Tracking**: Real-time quantity and value monitoring
- **Profit Margins**: Cost price and profit calculation
- **Search & Filter**: Find items by name, category, or stock level
- **Bulk Operations**: Add multiple items efficiently

### 🔍 Credit Scoring
- **Dynamic Calculation**: Based on actual business operations
- **Score Breakdown**: Transaction volume, payment reliability, profit margins
- **Risk Assessment**: Categorized levels (Excellent, Good, Fair, Moderate Risk, High Risk)
- **Weekly Analysis**: 7-day credit score trends
- **Recommendations**: AI-powered business improvement suggestions

### 🔗 Blockchain Integration
- **Automatic Sales Recording**: Every sale added to blockchain
- **Immutable Transaction History**: Complete sales ledger
- **Chain Verification**: Validate blockchain integrity
- **Store Analytics**: Per-store performance metrics
- **Real-time Updates**: Live blockchain data

### 📈 Predictive Analytics
- **Sales Predictions**: AI-powered revenue forecasting
- **Inventory Forecasting**: Stock level predictions
- **Business Insights**: Growth probability assessment
- **Trend Analysis**: Historical performance patterns

### 📷 Barcode Scanner
- **Visual Feedback**: Blue border when ready, green when scanning
- **Centered Interface**: Optimized scanning experience
- **Auto-navigation**: Directs to product action forms
- **Dual Mode**: Add items and remove items (sales)

### 🎨 Modern UI/UX
- **Color Palette**: Professional blue theme (#448BEF, #44D3EF, #6B44EF)
- **Responsive Design**: Optimized for mobile devices
- **Intuitive Navigation**: Bottom tab navigation with clear icons
- **Visual Feedback**: Color-coded status indicators

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
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
- **Mobile**: Scan QR code with Expo Go app
- **Android Emulator**: Press 'a' in terminal
- **iOS Simulator**: Press 'i' in terminal (Mac only)
- **Web Browser**: Press 'w' in terminal

## 📁 Project Structure

```
Syntax_HackForBusiness/
├── app/                          # React Native screens
│   ├── (auth)/                   # Authentication screens
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── home.tsx             # Dashboard with dynamic credit score
│   │   ├── stocks.tsx           # Inventory management
│   │   ├── scanner.tsx          # Barcode scanner (remove items)
│   │   ├── blockchain.tsx       # Blockchain verification
│   │   ├── predict.tsx          # Credit score analysis
│   │   └── history.tsx          # Business analytics
│   ├── assets/                   # Images and icons
│   ├── add-item-scanner.tsx     # Scanner for adding items
│   ├── product-action.tsx       # Product add/remove form
│   ├── credit-score-calculator.tsx # Credit score calculator
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
│   ├── ScanContext.tsx          # Scanner and inventory state
│   └── BlockchainContext.tsx    # Blockchain operations
├── services/                    # API services
│   ├── apiService.ts            # HTTP client
│   └── creditScoreService.ts    # Credit score calculations
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
- `GET /api/predictions/:id` - Get AI predictions

#### Python AI Services (Port 5000)
- `POST /calculate_credit_score` - Calculate credit score
- `GET /health` - Health check

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=3001
PYTHON_API_URL=http://192.168.78.234:5000
```

### App Configuration (`app.json`)
```json
{
  "expo": {
    "name": "BizSathi",
    "slug": "BizSathi",
    "version": "1.0.0",
    "icon": "./app/assets/logo.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./app/assets/logo.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

## 📖 Usage Guide

### 1. Authentication
- Open the app
- Use any username and password (mock authentication)
- You'll be redirected to the main dashboard
- Session persists until logout

### 2. Dashboard
- **Credit Score**: View dynamic score with risk category
- **Inventory Value**: See total stock value and item count
- **Today's Activity**: Monitor daily operations
- **AI Predictions**: View next month forecasts
- **Low Stock Alerts**: Get notified of items running low

### 3. Inventory Management

#### Adding Products
1. Go to **Stocks** tab
2. Tap **Add Item** button
3. Enter product details:
   - Product name
   - Barcode (optional)
   - Category
   - Quantity
   - Selling price
   - Cost price (for profit calculation)
4. Tap **Add Product**

#### Adding Products via Scanner
1. Go to **Stocks** tab
2. Tap **Scan to Add** button
3. Point camera at product barcode
4. Fill in product details
5. Confirm addition

#### Removing Products (Sales)
1. Go to **Scanner** tab
2. Point camera at product barcode
3. Product will be automatically removed from inventory
4. Sale is recorded on blockchain
5. View confirmation message

### 4. Credit Score Analysis
1. Go to **Credit Score** tab
2. View dynamic credit score calculation
3. See score breakdown by factors
4. Check weekly trend analysis
5. Review business recommendations
6. Access credit score calculator for manual input

### 5. Blockchain Records
1. Go to **Blockchain** tab
2. View all sales records in blockchain
3. Each record is stored in immutable blockchain
4. Verify transaction integrity
5. Monitor store performance metrics

### 6. Business Analytics
1. Go to **History** tab
2. View complete operation history
3. Analyze sales patterns
4. Track inventory changes
5. Export data for external analysis

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
- Verify network connectivity
- Check API_BASE_URL in apiService.ts

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

#### 5. Infinite Re-render Warnings
- Check useEffect dependencies
- Verify context providers
- Ensure no circular dependencies in state updates

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
- Use useCallback and useMemo for performance
- Avoid circular dependencies in useEffect

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
  riskCategory: string;
  joinDate: string;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  quantity: number;
  price: number;
  costPrice: number;
  exists: boolean;
  addedDate: string;
}
```

### Credit Score
```typescript
interface CreditScore {
  shopkeeperId: string;
  score: number;
  riskLevel: 'Excellent' | 'Good' | 'Fair' | 'Moderate Risk' | 'High Risk';
  breakdown: {
    transactionVolume: number;
    paymentReliability: number;
    profitMargin: number;
    businessLongevity: number;
    revenueConsistency: number;
  };
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
  previousHash: string;
}
```

### Inventory Operation
```typescript
interface InventoryOperation {
  type: 'add' | 'remove';
  product: Product;
  quantity: number;
  timestamp: string;
}
```

## 🔒 Security Considerations

### Current Implementation
- JWT token-based authentication
- Secure token storage in AsyncStorage
- Basic input validation
- SQLite database (local storage)
- Error handling without data exposure

### Production Recommendations
- Implement proper JWT authentication with refresh tokens
- Add comprehensive input sanitization
- Use environment variables for secrets
- Implement rate limiting
- Add HTTPS encryption
- Use production database (PostgreSQL/MySQL)
- Add API key authentication
- Implement audit logging

## 🚀 Deployment

### Building for Production

#### Android APK (Easiest for testing)
```bash
# Login to Expo
npx expo login

# Build APK
npx eas build --platform android --profile preview
```

#### Android AAB (Google Play Store)
```bash
npx eas build --platform android --profile production
```

#### iOS IPA (App Store)
```bash
npx eas build --platform ios --profile production
```

### Backend Deployment
1. Set up production server
2. Install Node.js and dependencies
3. Configure environment variables
4. Use PM2 for process management
5. Set up reverse proxy (Nginx)
6. Configure SSL certificates

### Python API Deployment
1. Deploy to cloud platform (Heroku/AWS)
2. Use Gunicorn for production
3. Configure environment variables
4. Set up monitoring and logging

### Local Network Deployment
For local network deployment:
1. Update API_BASE_URL to server's local IP
2. Ensure all devices are on same network
3. Configure firewall to allow connections
4. Use static IP for backend server

## 📈 Performance Optimization

### Frontend
- Lazy loading of components
- Image optimization and caching
- Memory leak prevention
- Efficient re-renders with useMemo/useCallback
- Bundle size optimization

### Backend
- Database indexing for queries
- Query optimization
- Caching strategies (Redis)
- Connection pooling
- Rate limiting

### Database
- Regular backups
- Index optimization
- Query performance monitoring
- Data archiving for old records

## 🔄 Updates & Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Update Expo SDK
npx expo install --fix

# Update EAS CLI
npm install -g eas-cli@latest
```

### Database Migrations
```bash
# Backup current data
# Run migration scripts
# Verify data integrity
# Test all functionality
```

## 📋 Production Checklist

- [ ] All features tested on real devices
- [ ] Backend deployed and accessible
- [ ] API endpoints secured with authentication
- [ ] Error handling implemented for all scenarios
- [ ] Performance optimized for production
- [ ] App store guidelines met
- [ ] Privacy policy updated
- [ ] Terms of service included
- [ ] Support contact information added
- [ ] Analytics tracking configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up
- [ ] Security audit completed
- [ ] Load testing performed

## 📞 Support

### Getting Help
1. Check this documentation
2. Review error logs in console
3. Test individual components
4. Verify network connectivity
5. Restart all services
6. Clear caches if needed

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

# Build for production
npx eas build --platform android --profile production
```

### Debug Mode
```bash
# Enable debug logging
npx expo start --dev-client

# View logs
npx expo logs

# Debug with React Native Debugger
# Install and run React Native Debugger
```

## 📝 License

This project is developed for hackathon and business purposes. Please ensure compliance with local regulations and data protection laws.

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Maintainer:** Team Syntax  
**Technology Stack:** React Native, Expo, Node.js, Python Flask, SQLite, Blockchain
