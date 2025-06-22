const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');
const { SalesBlockchain, Product, SaleTransaction } = require('./blockchain_service');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://192.168.78.234:5000';

// Initialize blockchain
const salesBlockchain = new SalesBlockchain(2);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    business_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Shopkeeper data table
  db.run(`CREATE TABLE IF NOT EXISTS shopkeeper_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopkeeper_id TEXT NOT NULL,
    name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    month INTEGER NOT NULL,
    transactions INTEGER DEFAULT 0,
    on_time_payments INTEGER DEFAULT 0,
    missed_payments INTEGER DEFAULT 0,
    avg_transaction_amount REAL DEFAULT 0,
    profit REAL DEFAULT 0,
    revenue REAL DEFAULT 0,
    expenses REAL DEFAULT 0,
    days_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample data
  insertSampleData();
}

function insertSampleData() {
  // Check if sample data already exists
  db.get("SELECT COUNT(*) as count FROM shopkeeper_data", (err, row) => {
    if (err) {
      console.error('Error checking sample data:', err);
      return;
    }
    
    if (row.count === 0) {
      // Insert sample shopkeeper data
      const sampleData = [
        ['1', 'Ram Kumar', 'Grocery Store', 6, 85, 78, 7, 1250, 45000, 180000, 135000, 28],
        ['1', 'Ram Kumar', 'Grocery Store', 5, 82, 75, 7, 1200, 43500, 168000, 124500, 28],
        ['1', 'Ram Kumar', 'Grocery Store', 4, 80, 73, 7, 1180, 42000, 165000, 123000, 28],
        ['1', 'Ram Kumar', 'Grocery Store', 3, 78, 72, 6, 1150, 41000, 162000, 121000, 28],
        ['1', 'Ram Kumar', 'Grocery Store', 2, 75, 70, 5, 1120, 40000, 160000, 120000, 28],
        ['1', 'Ram Kumar', 'Grocery Store', 1, 72, 68, 4, 1100, 38000, 155000, 117000, 28]
      ];

      const stmt = db.prepare(`INSERT INTO shopkeeper_data 
        (shopkeeper_id, name, business_type, month, transactions, on_time_payments, 
         missed_payments, avg_transaction_amount, profit, revenue, expenses, days_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      sampleData.forEach(row => stmt.run(row));
      stmt.finalize();
      console.log('Sample data inserted');
    }
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Python API integration
async function calculateCreditScoreWithPython(data) {
  try {
    const response = await axios.post(`${PYTHON_API_URL}/calculate_credit_score`, data, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error calling Python API:', error.message);
    // Fallback to JavaScript calculation
    return calculateCreditScoreJS(data);
  }
}

// Fallback JavaScript credit score calculation
function calculateCreditScoreJS(data) {
  let score = 50; // Base score

  // Payment reliability (30 points)
  score += (data.payment_reliability || 0) * 30;

  // Profit margin (20 points)
  const profitMargin = (data.avg_profit_margin || 0) / 100;
  score += Math.min(profitMargin * 100, 20);

  // Transaction volume (15 points)
  const transactions = data.transactions_per_month || 0;
  score += Math.min(transactions / 10, 15);

  // Profit trend (15 points)
  if (data.profit_trend > 0) {
    score += 15;
  } else if (data.profit_trend > -10000) {
    score += 10;
  }

  return Math.round(Math.min(score, 100));
}

function getRiskCategory(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Moderate Risk';
  return 'High Risk';
}

// Routes

// Health check endpoint (no authentication required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    python_api_url: PYTHON_API_URL,
    timestamp: new Date().toISOString()
  });
});

// Simple blockchain test endpoint (no authentication required)
app.get('/api/blockchain/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Blockchain endpoint is accessible',
    blockchainInfo: {
      totalBlocks: salesBlockchain.chain.length,
      isValid: salesBlockchain.isChainValid(),
      difficulty: salesBlockchain.difficulty
    },
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // For demo purposes, accept any credentials
    // In production, you would check against database
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const token = jwt.sign(
      { id: 1, username, name: 'Ram Kumar', business_type: 'Grocery Store' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: 1,
        username,
        name: 'Ram Kumar',
        business_type: 'Grocery Store'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Shopkeeper routes
app.get('/api/shopkeepers', async (req, res) => {
  const query = `
    SELECT 
      shopkeeper_id,
      name,
      business_type,
      AVG(transactions) as transactions_per_month,
      SUM(on_time_payments) as on_time_payments,
      SUM(missed_payments) as missed_payments,
      AVG(avg_transaction_amount) as avg_transaction_amount,
      AVG(days_active) as days_active,
      AVG(profit) as monthly_profit_avg,
      AVG(revenue) as monthly_revenue_avg,
      COUNT(CASE WHEN profit < 0 THEN 1 END) as monthly_loss_count,
      AVG((profit / revenue) * 100) as avg_profit_margin,
      AVG((expenses / revenue) * 100) as avg_expense_ratio,
      (SUM(on_time_payments) * 1.0 / (SUM(on_time_payments) + SUM(missed_payments))) as payment_reliability,
      AVG(profit) as profit_trend,
      AVG(revenue) as revenue_trend
    FROM shopkeeper_data 
    GROUP BY shopkeeper_id, name, business_type
  `;

  db.all(query, async (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    try {
      // Calculate credit scores using Python API
      const shopkeepersWithScores = await Promise.all(
        rows.map(async (row) => {
          const creditData = {
            transactions: row.transactions_per_month,
            on_time_payments: row.on_time_payments,
            missed_payments: row.missed_payments,
            avg_transaction_amount: row.avg_transaction_amount,
            profit: row.monthly_profit_avg,
            revenue: row.monthly_revenue_avg,
            expenses: row.monthly_revenue_avg - row.monthly_profit_avg,
            days_active: row.days_active
          };

          const creditResult = await calculateCreditScoreWithPython(creditData);
          
          return {
            ...row,
            credit_score: creditResult.credit_score,
            risk_category: creditResult.risk_category,
            credit_calculation_date: creditResult.calculation_date
          };
        })
      );

      res.json(shopkeepersWithScores);
    } catch (error) {
      console.error('Error calculating credit scores:', error);
      res.status(500).json({ message: 'Error calculating credit scores' });
    }
  });
});

app.get('/api/shopkeepers/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      shopkeeper_id,
      name,
      business_type,
      AVG(transactions) as transactions_per_month,
      SUM(on_time_payments) as on_time_payments,
      SUM(missed_payments) as missed_payments,
      AVG(avg_transaction_amount) as avg_transaction_amount,
      AVG(days_active) as days_active,
      AVG(profit) as monthly_profit_avg,
      AVG(revenue) as monthly_revenue_avg,
      COUNT(CASE WHEN profit < 0 THEN 1 END) as monthly_loss_count,
      AVG((profit / revenue) * 100) as avg_profit_margin,
      AVG((expenses / revenue) * 100) as avg_expense_ratio,
      (SUM(on_time_payments) * 1.0 / (SUM(on_time_payments) + SUM(missed_payments))) as payment_reliability,
      AVG(profit) as profit_trend,
      AVG(revenue) as revenue_trend
    FROM shopkeeper_data 
    WHERE shopkeeper_id = ?
    GROUP BY shopkeeper_id, name, business_type
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    const creditScore = calculateCreditScoreJS(row);
    const shopkeeper = {
      ...row,
      credit_score: creditScore,
      risk_category: getRiskCategory(creditScore)
    };

    res.json(shopkeeper);
  });
});

app.post('/api/shopkeepers/data', authenticateToken, (req, res) => {
  const data = req.body;
  
  const query = `
    INSERT INTO shopkeeper_data 
    (shopkeeper_id, name, business_type, month, transactions, on_time_payments, 
     missed_payments, avg_transaction_amount, profit, revenue, expenses, days_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    data.shopkeeper_id,
    data.name,
    data.business_type,
    data.month,
    data.transactions,
    data.on_time_payments,
    data.missed_payments,
    data.avg_transaction_amount,
    data.profit,
    data.revenue,
    data.expenses,
    data.days_active
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Data added successfully', id: this.lastID });
  });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(DISTINCT shopkeeper_id) as total_shopkeepers,
      AVG(profit) as avg_profit,
      AVG(revenue) as avg_revenue
    FROM shopkeeper_data
  `;

  db.get(query, (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Mock monthly trends for now
    const monthlyTrends = [
      { month: 'Jan', total_profit: 42000, total_revenue: 165000, active_shopkeepers: 1 },
      { month: 'Feb', total_profit: 43500, total_revenue: 168000, active_shopkeepers: 1 },
      { month: 'Mar', total_profit: 44100, total_revenue: 172000, active_shopkeepers: 1 },
      { month: 'Apr', total_profit: 44800, total_revenue: 175000, active_shopkeepers: 1 },
      { month: 'May', total_profit: 45200, total_revenue: 178000, active_shopkeepers: 1 },
      { month: 'Jun', total_profit: 45000, total_revenue: 180000, active_shopkeepers: 1 }
    ];

    const stats = {
      total_shopkeepers: row.total_shopkeepers || 1,
      average_credit_score: 78, // Mock for now
      risk_distribution: {
        'Excellent': 0,
        'Good': 1,
        'Fair': 0,
        'Moderate Risk': 0,
        'High Risk': 0
      },
      monthly_trends: monthlyTrends
    };

    res.json(stats);
  });
});

// Business type analytics endpoint
app.get('/api/analytics/business-types', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      business_type,
      COUNT(DISTINCT shopkeeper_id) as count,
      AVG((profit / revenue) * 100) as avg_profit_margin
    FROM shopkeeper_data 
    GROUP BY business_type
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    const analytics = {};
    rows.forEach(row => {
      analytics[row.business_type] = {
        count: row.count,
        average_credit_score: 78, // Mock for now
        average_profit_margin: row.avg_profit_margin || 0,
        top_performers: ['Sample Shopkeeper'] // Mock for now
      };
    });

    res.json(analytics);
  });
});

// Credit report
app.get('/api/credit/report/:shopkeeperId', authenticateToken, (req, res) => {
  const { shopkeeperId } = req.params;
  
  // Mock credit report
  const report = {
    shopkeeper_id: shopkeeperId,
    name: 'Ram Kumar',
    business_type: 'Grocery Store',
    credit_score: 78,
    risk_category: 'Good',
    key_metrics: {
      avg_monthly_profit: 'NPR 45,000',
      profit_margin: '25%',
      payment_reliability: '92%',
      loss_months: '1',
      revenue_trend: '+8%',
      profit_trend: '+15%'
    },
    strengths: [
      'Excellent payment reliability',
      'Consistent monthly profits',
      'Good transaction volume'
    ],
    weaknesses: [
      'Could increase profit margins',
      'Consider expanding product range'
    ],
    recommendations: [
      'Focus on high-margin products',
      'Consider digital payment options',
      'Explore bulk purchasing opportunities'
    ]
  };

  res.json(report);
});

// CSV Upload and Processing Routes
app.post('/api/upload/csv', upload.single('file'), (req, res) => {
  // For demo purposes, skip authentication on CSV upload
  // In production, you should add: authenticateToken,
  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];
  const filePath = req.file.path;

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ message: 'Uploaded file not found' });
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      if (results.length === 0) {
        // Clean up empty file
        fs.unlinkSync(filePath);
        return res.status(400).json({ message: 'CSV file is empty or invalid' });
      }

      // Process the CSV data
      processCSVData(results, (err, processedData) => {
        if (err) {
          // Clean up file on error
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return res.status(500).json({ message: 'Error processing CSV', error: err.message });
        }

        // Save to database
        saveCSVDataToDatabase(processedData, (err, savedData) => {
          if (err) {
            // Clean up file on error
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            return res.status(500).json({ message: 'Error saving to database', error: err.message });
          }

          // Clean up uploaded file
          try {
            fs.unlinkSync(filePath);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }

          res.json({
            message: 'CSV processed successfully',
            processed_records: results.length,
            shopkeepers_added: savedData.length,
            data: savedData
          });
        });
      });
    })
    .on('error', (error) => {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error('CSV parsing error:', error);
      res.status(500).json({ message: 'Error parsing CSV file', error: error.message });
    });
});

function processCSVData(csvData, callback) {
  try {
    // Group data by shopkeeper_id
    const shopkeeperGroups = {};
    
    csvData.forEach(row => {
      const shopId = row.shopkeeper_id;
      if (!shopkeeperGroups[shopId]) {
        shopkeeperGroups[shopId] = [];
      }
      shopkeeperGroups[shopId].push(row);
    });

    // Process each shopkeeper
    const processedData = [];
    
    Object.keys(shopkeeperGroups).forEach(shopId => {
      const group = shopkeeperGroups[shopId];
      const aggregated = aggregateShopkeeperData(group);
      processedData.push(aggregated);
    });

    callback(null, processedData);
  } catch (error) {
    callback(error);
  }
}

function aggregateShopkeeperData(group) {
  // Sort by month
  group.sort((a, b) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    return months.indexOf(a.month) - months.indexOf(b.month);
  });

  const firstRecord = group[0];
  
  // Calculate aggregated metrics
  const transactions_per_month = group.reduce((sum, row) => sum + parseInt(row.transactions), 0) / group.length;
  const on_time_payments = group.reduce((sum, row) => sum + parseInt(row.on_time_payments), 0);
  const missed_payments = group.reduce((sum, row) => sum + parseInt(row.missed_payments), 0);
  const avg_transaction_amount = group.reduce((sum, row) => sum + parseFloat(row.avg_transaction_amount), 0) / group.length;
  const days_active = group.reduce((sum, row) => sum + parseInt(row.days_active), 0);
  const monthly_profit_avg = group.reduce((sum, row) => sum + parseFloat(row.profit), 0) / group.length;
  const monthly_revenue_avg = group.reduce((sum, row) => sum + parseFloat(row.revenue), 0) / group.length;
  const monthly_loss_count = group.filter(row => parseFloat(row.profit) < 0).length;
  const avg_profit_margin = (monthly_profit_avg / monthly_revenue_avg) * 100;
  const avg_expense_ratio = group.reduce((sum, row) => sum + (parseFloat(row.expenses) / parseFloat(row.revenue)), 0) / group.length * 100;
  const payment_reliability = on_time_payments / (on_time_payments + missed_payments) * 100;

  // Calculate trends (simplified)
  const profit_trend = group.length > 1 ? 
    (parseFloat(group[group.length - 1].profit) - parseFloat(group[0].profit)) / parseFloat(group[0].profit) * 100 : 0;
  const revenue_trend = group.length > 1 ? 
    (parseFloat(group[group.length - 1].revenue) - parseFloat(group[0].revenue)) / parseFloat(group[0].revenue) * 100 : 0;

  // Calculate credit score
  const creditScore = calculateCreditScoreJS({
    payment_reliability,
    avg_profit_margin,
    transactions_per_month,
    profit_trend
  });

  return {
    shopkeeper_id: firstRecord.shopkeeper_id,
    name: firstRecord.name,
    business_type: firstRecord.business_type,
    transactions_per_month,
    on_time_payments,
    missed_payments,
    avg_transaction_amount,
    days_active,
    monthly_profit_avg,
    monthly_revenue_avg,
    monthly_loss_count,
    avg_profit_margin,
    avg_expense_ratio,
    payment_reliability,
    profit_trend,
    revenue_trend,
    credit_score: creditScore,
    risk_category: getRiskCategory(creditScore)
  };
}

function saveCSVDataToDatabase(processedData, callback) {
  // Clear existing data
  db.run('DELETE FROM shopkeeper_data', (err) => {
    if (err) {
      return callback(err);
    }

    // Insert new aggregated data
    const stmt = db.prepare(`
      INSERT INTO shopkeeper_data 
      (shopkeeper_id, name, business_type, month, transactions, on_time_payments, 
       missed_payments, avg_transaction_amount, profit, revenue, expenses, days_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let insertedCount = 0;
    processedData.forEach(shopkeeper => {
      // Insert sample monthly data for each shopkeeper
      for (let month = 1; month <= 6; month++) {
        const monthlyData = {
          shopkeeper_id: shopkeeper.shopkeeper_id,
          name: shopkeeper.name,
          business_type: shopkeeper.business_type,
          month: month,
          transactions: Math.round(shopkeeper.transactions_per_month * (0.8 + Math.random() * 0.4)),
          on_time_payments: Math.round(shopkeeper.on_time_payments / 6 * (0.9 + Math.random() * 0.2)),
          missed_payments: Math.round(shopkeeper.missed_payments / 6 * (0.8 + Math.random() * 0.4)),
          avg_transaction_amount: shopkeeper.avg_transaction_amount * (0.9 + Math.random() * 0.2),
          profit: shopkeeper.monthly_profit_avg * (0.8 + Math.random() * 0.4),
          revenue: shopkeeper.monthly_revenue_avg * (0.8 + Math.random() * 0.4),
          expenses: shopkeeper.monthly_revenue_avg * (0.8 + Math.random() * 0.4) * (shopkeeper.avg_expense_ratio / 100),
          days_active: Math.round(shopkeeper.days_active / 6)
        };

        stmt.run([
          monthlyData.shopkeeper_id,
          monthlyData.name,
          monthlyData.business_type,
          monthlyData.month,
          monthlyData.transactions,
          monthlyData.on_time_payments,
          monthlyData.missed_payments,
          monthlyData.avg_transaction_amount,
          monthlyData.profit,
          monthlyData.revenue,
          monthlyData.expenses,
          monthlyData.days_active
        ], (err) => {
          if (err) {
            console.error('Error inserting data:', err);
          } else {
            insertedCount++;
          }
        });
      }
    });

    stmt.finalize(() => {
      callback(null, processedData);
    });
  });
}

// Product management endpoints
app.get('/api/products', (req, res) => {
  // For now, return mock data since we don't have a products table
  const mockProducts = [
    {
      id: '1',
      name: 'Sample Product 1',
      barcode: '123456789',
      quantity: 10,
      price: 25.99,
      addedDate: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Sample Product 2',
      barcode: '987654321',
      quantity: 5,
      price: 15.99,
      addedDate: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: mockProducts
  });
});

app.post('/api/products', (req, res) => {
  const { name, barcode, quantity, price } = req.body;
  
  if (!name || !quantity || !price) {
    return res.status(400).json({
      success: false,
      message: 'Name, quantity, and price are required'
    });
  }
  
  // Mock product creation
  const newProduct = {
    id: Date.now().toString(),
    name,
    barcode: barcode || `BAR${Date.now()}`,
    quantity: parseInt(quantity),
    price: parseFloat(price),
    addedDate: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Product added successfully',
    data: newProduct
  });
});

app.delete('/api/products/:barcode', (req, res) => {
  const { barcode } = req.params;
  
  // Mock product removal
  const removedProduct = {
    id: '1',
    name: 'Sample Product',
    barcode,
    quantity: 1,
    price: 25.99
  };
  
  res.json({
    success: true,
    message: 'Product removed successfully',
    data: {
      removedProduct
    }
  });
});

// Blockchain endpoints
app.get('/api/blockchain/status', (req, res) => {
  try {
    const blockchainData = salesBlockchain.getBlockchainData();
    res.json({
      status: 'success',
      data: blockchainData
    });
  } catch (error) {
    console.error('Error getting blockchain status:', error);
    res.status(500).json({ message: 'Error getting blockchain status' });
  }
});

app.post('/api/blockchain/sale', (req, res) => {
  try {
    const { storeId, products } = req.body;
    
    if (!storeId || !products || !Array.isArray(products)) {
      return res.status(400).json({ message: 'Invalid sale data' });
    }
    
    // Convert products to Product objects
    const productObjects = products.map(p => new Product(p.name, p.price, p.category, p.barcode));
    
    // Add sale to blockchain
    const newBlock = salesBlockchain.addSale(storeId, productObjects);
    
    res.json({
      status: 'success',
      message: 'Sale recorded on blockchain',
      data: {
        blockIndex: newBlock.index,
        transactionId: newBlock.transaction.txid,
        total: newBlock.transaction.total
      }
    });
  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({ message: 'Error recording sale on blockchain' });
  }
});

app.get('/api/blockchain/summary', (req, res) => {
  try {
    const { storeId } = req.query;
    const summary = salesBlockchain.getSalesSummary(storeId);
    
    res.json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    console.error('Error getting blockchain summary:', error);
    res.status(500).json({ message: 'Error getting blockchain summary' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log('Blockchain initialized with difficulty:', salesBlockchain.difficulty);
}); 