const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function smokeTest() {
  console.log('🚀 Starting Smoke Tests...\n');

  try {
    console.log('1. Testing Backend Health...');
    const health = await axios.get(`${BASE_URL}/`);
    console.log(`✅ Backend is UP: ${health.data}\n`);

    console.log('2. Testing User Registration...');
    const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'Test@123',
      role: 'Manager',
      companyName: 'Test Company',
    });
    const token = registerRes.data.token;
    console.log(`✅ User Registered. Token: ${token.substring(0, 20)}...\n`);

    console.log('3. Testing Inventory Fetch (Protected Route)...');
    const inventoryRes = await axios.get(`${BASE_URL}/api/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ Inventory Fetched: ${inventoryRes.data.data.length} items\n`);

    console.log('4. Testing Consume Inventory...');
    if (inventoryRes.data.data && inventoryRes.data.data.length > 0) {
      const itemId = inventoryRes.data.data[0]._id;
      const consumeRes = await axios.post(
        `${BASE_URL}/api/inventory/consume`,
        { itemId, quantityUsed: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`✅ Consumed 1 unit. New Stock: ${consumeRes.data.item.currentStock}\n`);
    } else {
      console.log('⚠️  No items in inventory to consume\n');
    }

    console.log('5. Testing Role-Based Access Control (RBAC)...');
    try {
      const validatorToken = (await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Validator User',
        email: `validator${Date.now()}@test.com`,
        password: 'Test@123',
        role: 'Validator',
      })).data.token;

      await axios.post(
        `${BASE_URL}/api/inventory/consume`,
        { itemId: inventoryRes.data.data[0]._id, quantityUsed: 1 },
        { headers: { Authorization: `Bearer ${validatorToken}` } }
      );
      console.log('❌ RBAC Failed: Validator should not consume inventory\n');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ RBAC Working: Validator blocked from consuming\n');
      }
    }

    console.log('🎉 All Smoke Tests Passed!\n');
  } catch (error) {
    console.log('❌ Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

smokeTest();
