const model = require('../model/schema')

const validBudget = (body) => {
    const amount = Number(body.amount)
    const start = new Date(body.startDate)
    const end = new Date(body.endDate)
    if (!body.amount || !Number.isFinite(amount) || amount < 0) throw Object.assign(new Error('Budget amount must be a non-negative number'), { status: 400 })
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) throw Object.assign(new Error('Invalid budget dates'), { status: 400 })
    return { amount, startDate: start, endDate: end }
}

exports.list = async (req, res) => {
    try {
        const budgets = await model.Budget.find({ groupId: req.groupId }).sort({ startDate: -1 })
        res.json({ status: 'success', budgets })
    } catch (err) { res.status(500).json({ message: err.message }) }
}

exports.create = async (req, res) => {
    try {
        const values = validBudget(req.body)
        const budget = await model.Budget.create({
            ...values,
            groupId: req.groupId,
            name: req.body.name || 'Monthly Budget',
            currency: req.body.currency || req.group.groupCurrency || 'INR',
            categoryBudgets: Array.isArray(req.body.categoryBudgets) ? req.body.categoryBudgets : [],
            createdBy: req.user
        })
        res.status(201).json({ status: 'success', budget })
    } catch (err) { res.status(err.status || 500).json({ message: err.message }) }
}

exports.update = async (req, res) => {
    try {
        const values = validBudget(req.body)
        const budget = await model.Budget.findOneAndUpdate({ _id: req.body.budgetId, groupId: req.groupId }, {
            ...values,
            name: req.body.name || 'Monthly Budget',
            currency: req.body.currency || req.group.groupCurrency || 'INR',
            categoryBudgets: Array.isArray(req.body.categoryBudgets) ? req.body.categoryBudgets : []
        }, { new: true, runValidators: true })
        if (!budget) return res.status(404).json({ message: 'Budget not found' })
        res.json({ status: 'success', budget })
    } catch (err) { res.status(err.status || 500).json({ message: err.message }) }
}

exports.remove = async (req, res) => {
    try {
        const result = await model.Budget.deleteOne({ _id: req.body.budgetId, groupId: req.groupId })
        if (!result.deletedCount) return res.status(404).json({ message: 'Budget not found' })
        res.json({ status: 'success', message: 'Budget deleted' })
    } catch (err) { res.status(500).json({ message: err.message }) }
}

exports.summary = async (req, res) => {
    try {
        const budget = await model.Budget.findOne({ _id: req.body.budgetId, groupId: req.groupId })
        if (!budget) return res.status(404).json({ message: 'Budget not found' })
        const expenses = await model.Expense.find({ groupId: req.groupId, expenseDate: { $gte: budget.startDate, $lte: budget.endDate } }).lean()
        const spent = expenses.reduce((sum, expense) => sum + Number(expense.expenseAmount || 0), 0)
        const byCategory = expenses.reduce((result, expense) => {
            const category = expense.expenseCategory || 'Others'
            result[category] = (result[category] || 0) + Number(expense.expenseAmount || 0)
            return result
        }, {})
        const percentageUsed = budget.amount ? (spent / budget.amount) * 100 : 0
        res.json({ status: 'success', budget, summary: { spent, remaining: budget.amount - spent, percentageUsed, status: percentageUsed >= 100 ? 'over' : percentageUsed >= 80 ? 'near' : 'under', byCategory } })
    } catch (err) { res.status(500).json({ message: err.message }) }
}
