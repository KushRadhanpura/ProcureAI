const express = require('express');
const router = express.Router();
const { getVendors, createVendor } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getVendors);
router.post('/', protect, authorize('Owner', 'Manager'), createVendor);

module.exports = router;
