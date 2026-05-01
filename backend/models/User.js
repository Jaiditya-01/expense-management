const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Employee'], default: 'Employee' },
  isManagerApprover: { type: Boolean, default: false },  // As per NOTE in problem statement
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // For employee-manager relation
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
