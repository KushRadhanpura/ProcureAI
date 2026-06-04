const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
  {
    id: '6a205f53f8cd354b7de9f60f',
    role: 'Owner',
    companyId: '6a205f53f8cd354b7de9f60f',
    name: 'Test Owner'
  },
  process.env.JWT_SECRET || 'kush_123',
  { expiresIn: '1h' }
);

// Yeh function random number generate karta hai (5 saal ke bacche ke liye: 'Luck draw')
const getRandomQuantity = (max) => Math.floor(Math.random() * max) + 1;

async function runTestSuite(itemId) {
    const testCases = [
        { id: "TC_001", description: "Valid Consumption", qty: getRandomQuantity(5) },
        { id: "TC_002", description: "Oversized Consumption (Should Fail)", qty: 9999 },
        { id: "TC_003", description: "Zero/Negative Consumption (Should Fail)", qty: -1 },
        { id: "TC_004", description: "Invalid ItemID (Should Fail)", qty: 1, customId: "123_invalid" }
    ];

    console.log("=== STARTING STRESS & FUNCTIONAL TEST ===\n");

    for (const tc of testCases) {
        try {
            // Step 1: Get original state
            // Note: In real QA, we'd fetch the item first, but here we'll analyze the response.
            
            const payload = {
                itemId: tc.customId || itemId,
                quantityUsed: tc.qty
            };

            const response = await axios.post('http://localhost:5000/api/inventory/consume', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Step 2: Validate 200 OK and Logic
            if (response.status === 200) {
                console.log(JSON.stringify({
                    test_case_id: tc.id,
                    status: "PASS",
                    error_log: "None",
                    recommendation: "Logic is solid for valid inputs."
                }, null, 2));
            }

        } catch (error) {
            const status = error.response ? error.response.status : "NETWORK_ERROR";
            let message = error.response ? error.response.data.message : error.message;

            if (!message && error.response) {
                message = JSON.stringify(error.response.data);
            }

            // Step 3: Analyze Failure
            let recommendation = "Check backend validation.";
            if (status === 404) {
                recommendation = "Item not found. Please provide a real MongoDB _id from your database.";
            } else if (status === 400 && tc.id === "TC_002") {
                recommendation = "Backend successfully blocked oversized request. Good job!";
            } else if (status === 400 && tc.qty <= 0) {
                recommendation = "Validation for negative numbers is working.";
            } else if (status === 500) {
                recommendation = "Critical Bug: Server crashed (500). Check server logs.";
            } else if (status === "NETWORK_ERROR") {
                recommendation = "Server is NOT running. Run 'node server.js' in another terminal.";
            }

            console.log(JSON.stringify({
                test_case_id: tc.id,
                status: status === 200 ? "PASS" : "FAIL/EXPECTED_ERR",
                error_log: message || "Unknown Error",
                recommendation: recommendation
            }, null, 2));
        }
    }
}

const mongoose = require('mongoose');
const Inventory = require('./models/inventory');

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/procureai');
        const item = await Inventory.findOne({});
        if (!item) {
            console.error("No items found in database. Seed the database first!");
            process.exit(1);
        }
        await runTestSuite(String(item._id));
        await mongoose.disconnect();
    } catch (err) {
        console.error("Database connection or query failed:", err.message);
        process.exit(1);
    }
}

main();
