const express = require('express');
const authMiddleware = require('../middleware/auth');
const Company = require('../models/Company');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  res.json(req.user.company);
});

router.put('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.currency) updates.currency = req.body.currency;

    const company = await Company.findByIdAndUpdate(req.user.company._id, updates, { new: true });
    res.json(company);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
