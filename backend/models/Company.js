const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, default: 'Default Company' },
  currency: { type: String, required: true },  // Set based on country
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
