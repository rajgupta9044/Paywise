const model = require('../model/schema')

const getReportData = async (groupId, body) => {
    const group = await model.Group.findOne({ _id: groupId }).lean()
    const query = { groupId }
    if (body.startDate || body.endDate) query.expenseDate = { ...(body.startDate ? { $gte: new Date(body.startDate) } : {}), ...(body.endDate ? { $lte: new Date(body.endDate) } : {}) }
    if (body.category) query.expenseCategory = body.category
    const expenses = await model.Expense.find(query).sort({ expenseDate: 1 }).lean()
    const settlements = await model.Settlement.find({ groupId }).lean()
    const total = expenses.reduce((sum, expense) => sum + Number(expense.expenseAmount || 0), 0)
    const totalSettled = settlements.reduce((sum, settlement) => sum + Number(settlement.settleAmount || 0), 0)
    const categories = {}
    const members = {}
    expenses.forEach(expense => {
        const category = expense.expenseCategory || 'Others'
        categories[category] = (categories[category] || 0) + Number(expense.expenseAmount || 0)
        members[expense.expenseOwner] = (members[expense.expenseOwner] || 0) + Number(expense.expenseAmount || 0)
    })
    return { group, expenses, total, totalSettled, outstanding: Math.max(0, total - totalSettled), categories, members, startDate: body.startDate || '', endDate: body.endDate || '' }
}

exports.summary = async (req, res) => {
    try {
        const data = await getReportData(req.groupId, req.body)
        const amounts = data.expenses.map(expense => Number(expense.expenseAmount || 0))
        const topCategory = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0]
        res.json({ status: 'success', summary: { totalSpending: data.total, averageExpense: amounts.length ? data.total / amounts.length : 0, largestExpense: amounts.length ? Math.max(...amounts) : 0, topCategory: topCategory?.[0] || 'None', totalSettled: data.totalSettled, outstanding: data.outstanding } })
    } catch (err) { res.status(500).json({ message: err.message }) }
}

const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`
exports.csv = async (req, res) => {
    try {
        const data = await getReportData(req.groupId, req.body)
        const rows = [['Date', 'Expense Name', 'Description', 'Category', 'Amount', 'Currency', 'Payer', 'Members', 'Expense Type']]
        data.expenses.forEach(expense => rows.push([expense.expenseDate?.toISOString?.() || expense.expenseDate, expense.expenseName, expense.expenseDescription, expense.expenseCategory, expense.expenseAmount, expense.expenseCurrency, expense.expenseOwner, (expense.expenseMembers || []).join(', '), expense.expenseType]))
        res.type('text/csv').attachment(`${data.group.groupName}-report.csv`).send(rows.map(row => row.map(csvCell).join(',')).join('\n'))
    } catch (err) { res.status(500).json({ message: err.message }) }
}

exports.pdf = async (req, res) => {
    try {
        const data = await getReportData(req.groupId, req.body)
        const lines = [`PayWise Financial Report`, `Group: ${data.group.groupName}`, `Period: ${data.startDate || 'All time'} to ${data.endDate || 'Present'}`, `Total spending: ${data.total}`, `Total settled: ${data.totalSettled}`, `Outstanding amount: ${data.outstanding}`, `Members: ${(data.group.groupMembers || []).length}`, '', 'Category spending:']
        Object.entries(data.categories).forEach(([category, amount]) => lines.push(`${category}: ${amount}`))
        lines.push('', 'Expenses:')
        data.expenses.forEach(expense => lines.push(`${expense.expenseDate?.toISOString?.().slice(0, 10) || ''} | ${expense.expenseName} | ${expense.expenseAmount} ${expense.expenseCurrency || ''} | ${expense.expenseOwner}`))
        const escapePdf = value => String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
        const content = ['BT', '/F1 11 Tf', '50 760 Td', ...lines.map((line, index) => `${index ? '0 -16 Td ' : ''}(${escapePdf(line).slice(0, 115)}) Tj`), 'ET'].join('\n')
        const objects = [`1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj`, `2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj`, `3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>endobj`, `4 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj`, `5 0 obj<< /Length ${Buffer.byteLength(content)} >>stream\n${content}\nendstream endobj`]
        let pdf = '%PDF-1.4\n'; const offsets = [0]
        objects.forEach(object => { offsets.push(Buffer.byteLength(pdf)); pdf += `${object}\n` })
        const xref = Buffer.byteLength(pdf); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`; offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
        pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
        res.type('application/pdf').attachment(`${data.group.groupName}-report.pdf`).send(Buffer.from(pdf))
    } catch (err) { res.status(500).json({ message: err.message }) }
}
