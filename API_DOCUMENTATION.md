# API Documentation

## Overview

This document describes all API endpoints available in the Shopkeeper Business Management System.

## Base URLs

- **Backend API**: `http://localhost:3001/api`
- **Python AI Services**: `http://localhost:5000`

## Authentication

Currently using mock authentication. Any username/password combination will work.

## Backend API Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user (mock implementation)

**Request Body:**
```json
{
  "username": "any_username",
  "password": "any_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "1",
    "username": "admin",
    "role": "admin"
  }
}
```

#### POST /api/auth/logout
Logout user

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Shopkeeper Management

#### GET /api/shopkeepers
Get all shopkeepers

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "creditScore": 750,
      "joinDate": "2024-01-01"
    }
  ]
}
```

#### POST /api/shopkeepers
Add new shopkeeper

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "address": "456 Oak Ave"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shopkeeper added successfully",
  "data": {
    "id": "2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "address": "456 Oak Ave",
    "creditScore": 0,
    "joinDate": "2024-12-19"
  }
}
```

#### PUT /api/shopkeepers/:id
Update shopkeeper

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "phone": "+1234567890",
  "address": "456 Oak Ave Updated"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shopkeeper updated successfully",
  "data": {
    "id": "2",
    "name": "Jane Smith Updated",
    "email": "jane.updated@example.com",
    "phone": "+1234567890",
    "address": "456 Oak Ave Updated",
    "creditScore": 0,
    "joinDate": "2024-12-19"
  }
}
```

#### DELETE /api/shopkeepers/:id
Delete shopkeeper

**Response:**
```json
{
  "success": true,
  "message": "Shopkeeper deleted successfully"
}
```

### Dashboard

#### GET /api/dashboard/stats
Get dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalShopkeepers": 5,
    "totalProducts": 25,
    "totalRevenue": 15000,
    "averageCreditScore": 720,
    "recentTransactions": 12
  }
}
```

### Inventory Management

#### GET /api/products
Get all products

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Product A",
      "barcode": "123456789",
      "quantity": 10,
      "price": 25.99,
      "addedDate": "2024-12-19"
    }
  ]
}
```

#### POST /api/products
Add new product

**Request Body:**
```json
{
  "name": "New Product",
  "barcode": "987654321",
  "quantity": 5,
  "price": 15.99
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added successfully",
  "data": {
    "id": "2",
    "name": "New Product",
    "barcode": "987654321",
    "quantity": 5,
    "price": 15.99,
    "addedDate": "2024-12-19"
  }
}
```

#### DELETE /api/products/:barcode
Remove product by barcode

**Response:**
```json
{
  "success": true,
  "message": "Product removed successfully",
  "data": {
    "removedProduct": {
      "id": "1",
      "name": "Product A",
      "barcode": "123456789",
      "quantity": 1,
      "price": 25.99
    }
  }
}
```

### Credit Scoring

#### POST /api/upload/csv
Upload CSV file for credit scoring

**Request:** Multipart form data with CSV file

**Response:**
```json
{
  "success": true,
  "message": "CSV uploaded and processed successfully",
  "data": {
    "processedRecords": 100,
    "creditScores": [
      {
        "shopkeeperId": "1",
        "score": 750,
        "riskLevel": "Low",
        "factors": ["Good payment history", "Stable income"]
      }
    ]
  }
}
```

#### GET /api/credit-scores
Get all credit scores

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "shopkeeperId": "1",
      "score": 750,
      "riskLevel": "Low",
      "factors": ["Good payment history", "Stable income"],
      "calculatedDate": "2024-12-19"
    }
  ]
}
```

### Blockchain

#### POST /api/blockchain/add-record
Add sales record to blockchain

**Request Body:**
```json
{
  "shopkeeperId": "1",
  "productId": "1",
  "quantity": 2,
  "totalAmount": 51.98
}
```

**Response:**
```json
{
  "success": true,
  "message": "Record added to blockchain",
  "data": {
    "id": "1",
    "shopkeeperId": "1",
    "productId": "1",
    "quantity": 2,
    "totalAmount": 51.98,
    "timestamp": "2024-12-19T10:30:00Z",
    "blockHash": "abc123def456..."
  }
}
```

#### GET /api/blockchain/records
Get all blockchain records

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "shopkeeperId": "1",
      "productId": "1",
      "quantity": 2,
      "totalAmount": 51.98,
      "timestamp": "2024-12-19T10:30:00Z",
      "blockHash": "abc123def456...",
      "previousHash": "000000000000...",
      "nonce": 12345
    }
  ]
}
```

#### GET /api/blockchain/verify
Verify blockchain integrity

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "totalBlocks": 5,
    "lastBlockHash": "abc123def456..."
  }
}
```

## Python AI Services Endpoints

### Health Check

#### GET /health
Check if Python API is running

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### Credit Scoring

#### POST /calculate_credit_score
Calculate credit score from data

**Request Body:**
```json
{
  "data": [
    {
      "shopkeeper_id": "1",
      "payment_history": "Good",
      "income": 50000,
      "debt_ratio": 0.3,
      "credit_history_length": 5
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "credit_scores": [
    {
      "shopkeeper_id": "1",
      "score": 750,
      "risk_level": "Low",
      "factors": ["Good payment history", "Stable income", "Low debt ratio"]
    }
  ]
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
- `NETWORK_ERROR` - Network connection failed

### Example Error Response
```json
{
  "success": false,
  "error": "Product not found",
  "code": "404"
}
```

## Rate Limiting

Currently no rate limiting implemented. For production, consider implementing:
- Request per minute limits
- IP-based throttling
- User-based quotas

## CORS Configuration

Backend is configured to accept requests from:
- `http://localhost:8081` (Expo development server)
- `http://localhost:19006` (Expo web)
- `exp://localhost:8081` (Expo mobile)

## Testing Endpoints

### Using curl

```bash
# Test backend health
curl http://localhost:3001/api/shopkeepers

# Test Python API health
curl http://localhost:5000/health

# Add shopkeeper
curl -X POST http://localhost:3001/api/shopkeepers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"+1234567890","address":"Test Address"}'

# Calculate credit score
curl -X POST http://localhost:5000/calculate_credit_score \
  -H "Content-Type: application/json" \
  -d '{"data":[{"shopkeeper_id":"1","payment_history":"Good","income":50000,"debt_ratio":0.3,"credit_history_length":5}]}'
```

### Using JavaScript

```javascript
// Test API connection
fetch('http://localhost:3001/api/shopkeepers')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## WebSocket Support

Currently no WebSocket endpoints. For real-time features, consider adding:
- Live inventory updates
- Real-time notifications
- Live credit score updates

## File Upload

### CSV Upload Format

Expected CSV format for credit scoring:
```csv
shopkeeper_id,payment_history,income,debt_ratio,credit_history_length
1,Good,50000,0.3,5
2,Fair,35000,0.5,3
3,Excellent,75000,0.2,8
```

### Supported File Types
- CSV files for credit scoring
- Images for product photos (future feature)

## Security Considerations

### Current Implementation
- Mock authentication
- Basic input validation
- No encryption for sensitive data

### Production Recommendations
- Implement JWT authentication
- Add input sanitization
- Use HTTPS
- Implement rate limiting
- Add API key authentication
- Encrypt sensitive data

## Monitoring and Logging

### Log Format
```
[2024-12-19 10:30:00] [INFO] GET /api/shopkeepers - 200 OK
[2024-12-19 10:30:01] [ERROR] POST /api/products - 400 Bad Request
```

### Metrics to Monitor
- Request count per endpoint
- Response times
- Error rates
- Database connection status
- Memory usage

## Versioning

Current API version: v1.0

For future versions, consider:
- URL versioning: `/api/v2/endpoint`
- Header versioning: `Accept: application/vnd.api+json;version=2`
- Query parameter versioning: `?version=2`

---

**Last Updated:** December 2024
**API Version:** 1.0.0 