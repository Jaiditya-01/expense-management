const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const canAccessExpense = (user, expense) => {
  if (user.role === 'Admin') return true;
  if (expense.submittedBy._id?.equals?.(user._id) || expense.submittedBy.equals?.(user._id)) return true;
  if (user.role === 'Manager') return true;
  return false;
};

const populateExpense = (query) =>
  query
    .populate('submittedBy', 'email role manager')
    .populate('reviewedBy', 'email role')
    .sort({ createdAt: -1 });

router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = { company: req.user.company._id };

    if (req.user.role === 'Employee') {
      filter.submittedBy = req.user._id;
    } else if (req.user.role === 'Manager') {
      filter.$or = [{ submittedBy: req.user._id }, { approvalLevel: 'manager' }];
    }

    const expenses = await populateExpense(Expense.find(filter));
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('submittedBy', 'email role manager')
      .populate('reviewedBy', 'email role');

    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    if (!expense.company.equals(req.user.company._id) || !canAccessExpense(req.user, expense)) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    res.json(expense);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { description, category, amount, date, comments, receipt, receiptName } = req.body;

  if (!description || !category || !amount || !date) {
    return res.status(400).json({ msg: 'Description, category, amount, and date are required' });
  }

  try {
    const expense = new Expense({
      description,
      category,
      amount,
      date,
      comments,
      receipt,
      receiptName,
      submittedBy: req.user._id,
      company: req.user.company._id,
    });

    await expense.save();
    const populated = await Expense.findById(expense._id).populate('submittedBy', 'email role manager');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    if (!expense.company.equals(req.user.company._id)) return res.status(403).json({ msg: 'Unauthorized' });
    if (!expense.submittedBy.equals(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    if (expense.status !== 'pending') {
      return res.status(400).json({ msg: 'Only pending expenses can be edited' });
    }

    const allowed = ['description', 'category', 'amount', 'date', 'comments', 'receipt', 'receiptName'];
    allowed.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') expense[field] = req.body[field];
    });

    await expense.save();
    const populated = await Expense.findById(expense._id).populate('submittedBy', 'email role manager');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    if (!expense.company.equals(req.user.company._id)) return res.status(403).json({ msg: 'Unauthorized' });
    if (!expense.submittedBy.equals(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    if (expense.status !== 'pending') {
      return res.status(400).json({ msg: 'Only pending expenses can be deleted' });
    }

    await expense.deleteOne();
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/:id/approve', authMiddleware, async (req, res) => {
  const { action, comment } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ msg: 'Action must be approve or reject' });
  }

  if (!['Admin', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    if (!expense.company.equals(req.user.company._id)) return res.status(403).json({ msg: 'Unauthorized' });
    if (expense.status !== 'pending') return res.status(400).json({ msg: 'Expense already reviewed' });

    expense.status = action === 'approve' ? 'approved' : 'rejected';
    expense.reviewedBy = req.user._id;
    expense.reviewedAt = new Date();
    expense.approvalComment = comment || '';

    await expense.save();
    const populated = await Expense.findById(expense._id)
      .populate('submittedBy', 'email role manager')
      .populate('reviewedBy', 'email role');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
