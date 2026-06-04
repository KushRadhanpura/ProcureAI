const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    currentStock: { type: Number, required: true, min: 0 },
    thresholdLimit: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
