const fetch = require('node-fetch');

const API_BASE_URL = 'http://192.168.78.234:3001/api';

async function testAppConnection() {
  console.log('🧪 Testing App Connection (mimicking React Native app)...\n');

  try {
    // Test 1: Shopkeepers endpoint (exactly like your app)
    console.log('1. Testing /shopkeepers endpoint...');
    const shopkeepersResponse = await fetch(`${API_BASE_URL}/shopkeepers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!shopkeepersResponse.ok) {
      throw new Error(`HTTP error! status: ${shopkeepersResponse.status}`);
    }
    
    const shopkeepersData = await shopkeepersResponse.json();
    console.log('✅ Shopkeepers endpoint working:', shopkeepersData.length, 'shopkeepers found');

    // Test 2: Dashboard stats endpoint (exactly like your app)
    console.log('2. Testing /dashboard/stats endpoint...');
    const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!statsResponse.ok) {
      throw new Error(`HTTP error! status: ${statsResponse.status}`);
    }
    
    const statsData = await statsResponse.json();
    console.log('✅ Dashboard stats endpoint working:', statsData.total_shopkeepers, 'total shopkeepers');

    // Test 3: Products endpoint
    console.log('3. Testing /products endpoint...');
    const productsResponse = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!productsResponse.ok) {
      throw new Error(`HTTP error! status: ${productsResponse.status}`);
    }
    
    const productsData = await productsResponse.json();
    console.log('✅ Products endpoint working:', productsData.data.length, 'products found');

    console.log('\n🎉 All endpoints are working correctly!');
    console.log('The issue might be in your React Native app configuration.');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 This suggests the issue is in your React Native app, not the backend.');
    console.log('Try these solutions:');
    console.log('1. Clear Expo cache: npx expo start --clear');
    console.log('2. Restart your device/emulator');
    console.log('3. Check if your device is on the same WiFi network');
  }
}

testAppConnection(); 