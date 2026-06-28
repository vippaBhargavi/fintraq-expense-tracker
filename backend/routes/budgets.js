const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @GET /api/budgets?month=&year=
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year });

    // Get actual spending per category for this month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spending = await Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } }
    ]);

    const spendingMap = {};
    spending.forEach(s => { spendingMap[s._id] = s.spent; });

    const budgetsWithSpending = budgets.map(b => ({
      ...b.toObject(),
      spent: spendingMap[b.category] || 0,
      remaining: b.amount - (spendingMap[b.category] || 0)
    }));

    res.json({ success: true, budgets: budgetsWithSpending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/budgets
router.post('/', async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month, year },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, budget });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
