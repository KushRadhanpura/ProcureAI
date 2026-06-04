const axios = require('axios');
const PurchaseOrder = require('../models/purchaseOrder');
const { asyncHandler } = require('../middleware/errorHandler');

const getPurchaseOrders = asyncHandler(async (req, res) => {
  const orders = await PurchaseOrder.find({ companyId: req.user.id })
    .populate('itemId')
    .populate('vendorId');
  res.status(200).json({ success: true, orders });
});

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { itemId, vendorId, quantity, quotedPrice } = req.body;

  const order = await PurchaseOrder.create({
    itemId,
    vendorId,
    quantity,
    quotedPrice,
    companyId: req.user.id,
  });

  res.status(201).json({ success: true, order });
});

const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, aiDraft } = req.body;

  const order = await PurchaseOrder.findByIdAndUpdate(
    id,
    { status, aiDraft },
    { new: true }
  );

  res.status(200).json({ success: true, order });
});

const parsePDF = asyncHandler(async (req, res) => {
  const { fileData, fileName } = req.body;

  if (!fileData) {
    return res.status(400).json({ success: false, message: 'No file data provided' });
  }

  try {
    const response = await axios.post('http://localhost:8000/parse-pdf', {
      base64_data: fileData,
      file_name: fileName || 'quote.pdf',
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('FastAPI PDF parse error:', error.message);
    res.status(500).json({ success: false, message: 'AI PDF parsing service failed' });
  }
});

module.exports = { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, parsePDF };
