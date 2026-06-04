const express = require('express');
const router = express.Router();
const { consumeInventory, getInventory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getInventory);
router.post('/consume', protect, authorize('Owner', 'Manager'), consumeInventory);

module.exports = router;
