/**
 * Run from backend/:  node test.js
 * Server must already be running:  node server.js  (same folder)
 */
require('dotenv').config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Inventory = require('./models/inventory');

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}`;
const ENDPOINT = `${BASE_URL}/api/inventory/consume`;
const MONGO_OPTS = { serverSelectionTimeoutMS: 5000 };

const token = jwt.sign(
  {
    id: '6a205f53f8cd354b7de9f60f',
    role: 'Owner',
    companyId: '6a205f53f8cd354b7de9f60f',
    name: 'Test Owner'
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

async function postConsume(body) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const hint =
      err.cause?.code === 'ECONNREFUSED' || err.message === 'fetch failed'
        ? `Cannot reach ${ENDPOINT}. Start the server first: cd backend && node server.js`
        : err.message;
    throw new Error(hint);
  }
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  const itemIdArg = process.argv[2];
  const qtyArg = Number(process.argv[3] ?? 1);

  console.log('--- Step 1: invalid itemId (expect 400 = PASS) ---');
  const bad = await postConsume({ itemId: 'not-a-valid-id', quantityUsed: 1 });
  console.log(bad.status, bad.data);
  if (bad.status === 400) {
    console.log('Step 1 PASSED — API rejected bad ID (no CastError).\n');
  } else {
    console.warn('Step 1 unexpected status — expected 400.\n');
  }

  let itemId = itemIdArg;
  if (!itemId) {
    console.log(
      `Step 2 setup: connecting to MongoDB (${process.env.MONGO_URI}) — timeout 5s...`
    );
    try {
      await mongoose.connect(process.env.MONGO_URI, MONGO_OPTS);
    } catch (err) {
      throw new Error(
        `MongoDB not reachable. On Pop!_OS try: sudo systemctl start mongod\n` +
          `Or install: sudo apt install mongodb-org\n` +
          `URI: ${process.env.MONGO_URI}\n` +
          `Details: ${err.message}`
      );
    }
    console.log('MongoDB connected — creating test item...');
    const item = await Inventory.create({
      itemName: 'Test Widget',
      currentStock: 50,
      thresholdLimit: 10,
    });
    itemId = String(item._id);
    await mongoose.disconnect();
    console.log('\nSeeded test item _id:', itemId);
  }

  console.log('--- Step 2: valid consume (expect 200 = PASS) ---');
  const ok = await postConsume({ itemId, quantityUsed: qtyArg });
  console.log(ok.status, ok.data);
  if (ok.status === 200) {
    console.log('Step 2 PASSED — stock updated.\n');
  } else {
    console.warn('Step 2 FAILED — check server logs and itemId.\n');
  }

  console.log('All tests finished. Endpoint:', ENDPOINT);
}

main().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
