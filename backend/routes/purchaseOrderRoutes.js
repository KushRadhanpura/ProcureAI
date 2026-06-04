const express = require('express');
const router = express.Router();
const { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, parsePDF } = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getPurchaseOrders);
router.post('/', protect, authorize('Owner', 'Manager'), createPurchaseOrder);
router.put('/:id', protect, authorize('Owner', 'Manager'), updatePurchaseOrder);
router.post('/parse-pdf', protect, authorize('Owner', 'Manager'), parsePDF);

module.exports = router;
