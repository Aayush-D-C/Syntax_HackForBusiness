const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testBlockchain() {
  console.log('🧪 Testing Blockchain Integration...\n');

  try {
    // 1. Check blockchain status
    console.log('1. Checking blockchain status...');
    const statusResponse = await axios.get(`${BASE_URL}/blockchain/status`);
    console.log('✅ Blockchain Status:', statusResponse.data.data);
    console.log('   - Valid:', statusResponse.data.data.isValid);
    console.log('   - Total Blocks:', statusResponse.data.data.totalBlocks);
    console.log('   - Difficulty:', statusResponse.data.data.difficulty);
    console.log('');

    // 2. Add sample sales
    console.log('2. Adding sample sales to blockchain...');
    const sampleSales = [
      {
        storeId: 'Ram Kumar Store',
        products: [
          { name: 'Rice (Basmati)', price: 120, category: 'Grains', barcode: '1234567890123' },
          { name: 'Cooking Oil', price: 250, category: 'Oils', barcode: '9876543210987' }
        ]
      },
      {
        storeId: 'Local Grocery',
        products: [
          { name: 'Sugar (White)', price: 180, category: 'Sweeteners', barcode: '4567891234567' }
        ]
      }
    ];

    for (let i = 0; i < sampleSales.length; i++) {
      const sale = sampleSales[i];
      console.log(`   Adding sale ${i + 1} for ${sale.storeId}...`);
      
      const saleResponse = await axios.post(`${BASE_URL}/blockchain/sale`, sale);
      
      console.log(`   ✅ Sale recorded! Block #${saleResponse.data.data.blockIndex}`);
      console.log(`   Transaction ID: ${saleResponse.data.data.transactionId}`);
      console.log(`   Total: NPR ${saleResponse.data.data.total}`);
      console.log('');
    }

    // 3. Get updated blockchain status
    console.log('3. Getting updated blockchain status...');
    const updatedStatusResponse = await axios.get(`${BASE_URL}/blockchain/status`);
    console.log('✅ Updated Blockchain Status:');
    console.log('   - Total Blocks:', updatedStatusResponse.data.data.totalBlocks);
    console.log('   - Valid:', updatedStatusResponse.data.data.isValid);
    console.log('   - Total Transactions:', updatedStatusResponse.data.data.summary.transactions);
    console.log('   - Total Revenue: NPR', updatedStatusResponse.data.data.summary.totalRevenue);
    console.log('');

    console.log('🎉 Blockchain test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing blockchain:', error.response?.data || error.message);
  }
}

// Run the test
testBlockchain(); 