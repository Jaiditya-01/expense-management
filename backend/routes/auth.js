const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const Company = require('../models/Company');
const authMiddleware = require('../middleware/auth');
const { fallbackCountries, getCurrencyForCountry } = require('../utils/countries');
const router = express.Router();

const buildUserPayload = (user) => {
  const plain = user.toObject ? user.toObject() : user;
  delete plain.password;
  return {
    ...plain,
    id: String(plain._id),
  };
};

// Signup: Auto-create company and admin, set currency based on country
router.post('/signup', async (req, res) => {
  const { email, password, country, companyName } = req.body;

  if (!email || !password || !country) {
    return res.status(400).json({ msg: 'Email, password, and country are required' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    let countries = fallbackCountries;
    try {
      const countriesResponse = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
      countries = countriesResponse.data;
    } catch (err) {
      countries = fallbackCountries;
    }

    const currency = getCurrencyForCountry(country, countries);

    const company = new Company({ name: companyName || 'Default Company', currency });
    await company.save();

    const hashedPw = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPw, role: 'Admin', company: company._id });
    await user.save();
    await user.populate('company');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: buildUserPayload(user) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('company').populate('manager', 'email role');
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: buildUserPayload(user) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  res.json(buildUserPayload(req.user));
});

router.put('/profile', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Current password and new password are required' });
  }

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await user.populate('company');

    res.json(buildUserPayload(user));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Unauthorized' });

  try {
    const users = await User.find({ company: req.user.company._id })
      .select('-password')
      .populate('manager', 'email role')
      .sort({ createdAt: -1, email: 1 });
    res.json(users.map(buildUserPayload));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Create new users (employees/managers), assign roles, managers, isManagerApprover
router.post('/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Unauthorized' });

  const { email, password, role, managerId, isManagerApprover } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPw = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password: hashedPw,
      role: role || 'Employee',
      manager: managerId,
      isManagerApprover: isManagerApprover || false,
      company: req.user.company,  // Same company as admin
    });
    await user.save();
    await user.populate('manager', 'email role');
    await user.populate('company');

    res.status(201).json(buildUserPayload(user));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Update user (change role, manager, etc.)
router.put('/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Unauthorized' });

  const { role, managerId, isManagerApprover, password } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (!user.company.equals(req.user.company._id)) return res.status(403).json({ msg: 'Unauthorized' });

    if (role) user.role = role;
    user.manager = managerId || undefined;
    if (typeof isManagerApprover !== 'undefined') user.isManagerApprover = isManagerApprover;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    await user.populate('manager', 'email role');
    await user.populate('company');
    res.json(buildUserPayload(user));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Unauthorized' });
  if (String(req.user._id) === req.params.id) {
    return res.status(400).json({ msg: 'You cannot delete your own account' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (!user.company.equals(req.user.company._id)) return res.status(403).json({ msg: 'Unauthorized' });

    await user.deleteOne();
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
