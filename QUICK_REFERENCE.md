# Quick Reference Guide

## 🚀 Essential Commands

### Start All Services
```bash
# Terminal 1: Python API
cd Model && python credit_api_simple.py

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Frontend
npx expo start
```

### Stop All Services
```bash
# Kill all Node.js processes
taskkill /F /IM node.exe

# Kill all Python processes
taskkill /F /IM python.exe
```

### Clear Caches
```bash
# Clear Expo cache
npx expo start --clear

# Clear npm cache
npm cache clean --force
```

## 🔧 Troubleshooting

### Port Issues
```bash
# Check what's using ports
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill process by PID
taskkill /PID <PID_NUMBER> /F
```

### Network Issues
```bash
# Test backend
curl http://localhost:3001/api/shopkeepers

# Test Python API
curl http://localhost:5000/health

# Test blockchain
node test_blockchain.js
```

### Python Issues
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install Visual Studio Build Tools (Windows)
# Download from: https://visualstudio.microsoft.com/downloads/

# Reinstall requirements
pip install -r requirements_simple.txt
```

## 📱 App Navigation

### Tab Structure
- **Home** - Dashboard and overview
- **Stocks** - Inventory management (add items)
- **Scanner** - Barcode scanning (remove items)
- **History** - Transaction history
- **Credit Score** - Credit scoring and CSV upload
- **Blockchain** - Sales records blockchain
- **Shopkeepers** - Shopkeeper management

### Workflow
1. **Add Products**: Stocks tab → Add Item button
2. **Remove Products**: Scanner tab → Scan barcode
3. **View History**: History tab
4. **Credit Scoring**: Credit Score tab → Upload CSV
5. **Blockchain**: Blockchain tab → View records

## 🔑 Login Credentials

**Any username and password will work** (mock authentication)

Examples:
- Username: `admin`, Password: `admin`
- Username: `user`, Password: `password`
- Username: `test`, Password: `test`

## 📊 Data Models

### Shopkeeper
```typescript
{
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
{
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
{
  shopkeeperId: string;
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  factors: string[];
  calculatedDate: string;
}
```

### Blockchain Record
```typescript
{
  id: string;
  shopkeeperId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  timestamp: string;
  blockHash: string;
}
```

## 🌐 API Endpoints

### Backend (Port 3001)
- `GET /api/shopkeepers` - Get all shopkeepers
- `POST /api/shopkeepers` - Add shopkeeper
- `GET /api/products` - Get all products
- `POST /api/products` - Add product
- `DELETE /api/products/:barcode` - Remove product
- `GET /api/dashboard/stats` - Dashboard stats
- `POST /api/upload/csv` - Upload CSV for credit scoring
- `GET /api/credit-scores` - Get credit scores
- `POST /api/blockchain/add-record` - Add blockchain record
- `GET /api/blockchain/records` - Get blockchain records

### Python API (Port 5000)
- `GET /health` - Health check
- `POST /calculate_credit_score` - Calculate credit score

## 📁 Important Files

### Frontend
- `app/_layout.tsx` - Main navigation
- `app/(tabs)/` - Tab screens
- `services/apiService.ts` - API client
- `context/` - React contexts

### Backend
- `backend/server.js` - Main server
- `backend/blockchain_service.js` - Blockchain logic
- `backend/database.sqlite` - Database

### Python
- `Model/credit_api_simple.py` - Flask API
- `Model/credit_score.py` - Credit scoring logic
- `Model/requirements_simple.txt` - Dependencies

## 🐛 Common Errors

### "Network request failed"
- Check if backend is running on port 3001
- Check if Python API is running on port 5000
- Verify firewall settings

### "Port already in use"
- Kill processes using the ports
- Restart services

### "Python dependencies failed"
- Install Visual Studio Build Tools
- Upgrade pip
- Use `--only-binary=all` flag

### "Expo connection failed"
- Clear Expo cache
- Check network connectivity
- Restart Expo server

## 📞 Emergency Commands

### Reset Everything
```bash
# Stop all services
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Clear all caches
npx expo start --clear
npm cache clean --force

# Delete database (will recreate)
cd backend && del database.sqlite

# Restart services
cd Model && python credit_api_simple.py &
cd backend && npm start &
npx expo start
```

### Force Kill Everything
```bash
# Kill all processes
taskkill /F /IM node.exe
taskkill /F /IM python.exe
taskkill /F /IM expo.exe
taskkill /F /IM metro.exe
```

## 🔄 Development Workflow

### Making Changes
1. Edit code files
2. Save changes
3. App auto-reloads (hot reload)
4. Test functionality

### Adding Features
1. Update backend API (if needed)
2. Update frontend components
3. Test integration
4. Update documentation

### Debugging
1. Check terminal logs
2. Use browser dev tools
3. Test individual components
4. Verify API endpoints

## 📱 Testing Checklist

### Basic Functionality
- [ ] App starts without errors
- [ ] Login works with any credentials
- [ ] All tabs are accessible
- [ ] Navigation works properly

### Inventory Management
- [ ] Can add products from Stocks tab
- [ ] Can scan and remove products
- [ ] Product history is updated
- [ ] Barcode scanning works

### Credit Scoring
- [ ] CSV upload works
- [ ] Credit scores are calculated
- [ ] Results are displayed
- [ ] Risk levels are shown

### Blockchain
- [ ] Sales records are added
- [ ] Blockchain integrity is maintained
- [ ] Records are displayed
- [ ] Verification works

### API Connections
- [ ] Backend responds on port 3001
- [ ] Python API responds on port 5000
- [ ] No network errors in logs
- [ ] All endpoints work

## 🎯 Performance Tips

### Development
- Use hot reload for faster development
- Monitor terminal logs for errors
- Test on physical device when possible
- Keep all services running

### Production
- Implement proper authentication
- Add input validation
- Use environment variables
- Set up monitoring
- Implement rate limiting

---

**Remember:** Always start services in order:
1. Python API (Terminal 1)
2. Node.js Backend (Terminal 2)
3. React Native App (Terminal 3) 