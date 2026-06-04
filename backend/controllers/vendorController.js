const Vendor = require('../models/vendor');
const { asyncHandler } = require('../middleware/errorHandler');

const getVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find({ companyId: req.user.id });
  res.status(200).json({ success: true, vendors });
});

const createVendor = asyncHandler(async (req, res) => {
  const { name, email, phone, address, averagePrice, paymentTerms } = req.body;

  const vendor = await Vendor.create({
    name,
    email,
    phone,
    address,
    averagePrice,
    paymentTerms,
    companyId: req.user.id,
  });

  res.status(201).json({ success: true, vendor });
});

module.exports = { getVendors, createVendor };
