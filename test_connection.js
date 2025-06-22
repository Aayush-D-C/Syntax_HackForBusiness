const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testConnection() {
  console.log('🔍 Testing Backend Connection...\n');

  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health endpoint working:', healthResponse.data);
    console.log('');

    // Test 2: Blockchain test endpoint
    console.log('2. Testing blockchain endpoint...');
    const blockchainResponse = await axios.get(`${BASE_URL}/blockchain/test`);
    console.log('✅ Blockchain endpoint working:', blockchainResponse.data);
    console.log('');

    console.log('🎉 All tests passed! Your backend is accessible.');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure your backend server is running:');
      console.log('   cd backend');
      console.log('   node server.js');
    } else if (error.response) {
      console.log('\n💡 Server responded with error:', error.response.status);
      console.log('   Response:', error.response.data);
    }
  }
}

// Run the test
testConnection(); 