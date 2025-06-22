const axios = require('axios');

const BASE_URL = 'http://192.168.78.234:3001/api';

async function testConnection() {
  console.log('🧪 Testing Backend Connection...\n');

  try {
    // Test 1: Shopkeepers endpoint
    console.log('1. Testing shopkeepers endpoint...');
    const shopkeepersResponse = await axios.get(`${BASE_URL}/shopkeepers`);
    console.log('✅ Shopkeepers endpoint working:', shopkeepersResponse.data.length, 'shopkeepers found');

    // Test 2: Dashboard stats endpoint
    console.log('2. Testing dashboard stats endpoint...');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats`);
    console.log('✅ Dashboard stats endpoint working:', statsResponse.data.total_shopkeepers, 'total shopkeepers');

    // Test 3: Products endpoint
    console.log('3. Testing products endpoint...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Products endpoint working:', productsResponse.data.data.length, 'products found');

    // Test 4: Blockchain endpoint
    console.log('4. Testing blockchain endpoint...');
    const blockchainResponse = await axios.get(`${BASE_URL}/blockchain/status`);
    console.log('✅ Blockchain endpoint working:', blockchainResponse.data.data.totalBlocks, 'blocks');

    console.log('\n🎉 All endpoints are working correctly!');
    console.log('Your backend is fully functional and accessible.');

  } catch (error) {
    console.error('❌ Connection test failed:', error.response?.data || error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure backend is running: npm start in backend folder');
    console.log('2. Check if port 3001 is not blocked by firewall');
    console.log('3. Verify your IP address is correct');
  }
}

testConnection(); 