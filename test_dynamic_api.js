// test_dynamic_api.js
const fs = require('fs');
const path = require('path');

// Test the CSV upload functionality
async function testCSVUpload() {
  try {
    const csvPath = path.join(__dirname, 'Model', 'bizsathi_1000_shopkeepers.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('❌ CSV file not found. Please make sure the file exists.');
      return;
    }

    console.log('📁 CSV file found, testing upload...');
    
    // Check if form-data is available
    let FormData;
    try {
      FormData = require('form-data');
    } catch (error) {
      console.log('❌ form-data package not found. Installing...');
      console.log('Please run: npm install form-data');
      return;
    }
    
    const form = new FormData();
    form.append('file', fs.createReadStream(csvPath));

    // Make request to upload endpoint
    const response = await fetch('http://localhost:3001/api/upload/csv', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer mock-token'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ CSV uploaded successfully!');
      console.log(`📊 Processed ${result.processed_records} records`);
      console.log(`👥 Added ${result.shopkeepers_added} shopkeepers`);
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed:', response.status, errorText);
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Test getting shopkeepers
async function testGetShopkeepers() {
  try {
    const response = await fetch('http://localhost:3001/api/shopkeepers', {
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Shopkeepers retrieved successfully!');
      console.log(`📊 Found ${result.shopkeepers.length} shopkeepers`);
      
      // Show first few shopkeepers
      result.shopkeepers.slice(0, 3).forEach(shop => {
        console.log(`- ${shop.name} (${shop.business_type}): Score ${shop.credit_score} - ${shop.risk_category}`);
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get shopkeepers:', response.status, errorText);
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Test health endpoint
async function testHealth() {
  try {
    const response = await fetch('http://localhost:3001/api/health');
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Health check passed:', result.message);
    } else {
      console.log('❌ Health check failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Dynamic API Implementation...\n');
  
  console.log('0️⃣ Testing Health Check...');
  await testHealth();
  
  console.log('\n1️⃣ Testing CSV Upload...');
  await testCSVUpload();
  
  console.log('\n2️⃣ Testing Shopkeepers Retrieval...');
  await testGetShopkeepers();
  
  console.log('\n✅ Tests completed!');
}

runTests(); 