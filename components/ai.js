const model = require('../model/schema')

const aggregateExpenses = async (groupId, startDate, endDate) => {
    const query = { groupId }
    if (startDate || endDate) query.expenseDate = { ...(startDate ? { $gte: new Date(startDate) } : {}), ...(endDate ? { $lte: new Date(endDate) } : {}) }
    const expenses = await model.Expense.find(query).lean()
    const byCategory = {}
    const byMember = {}
    let total = 0
    expenses.forEach(expense => {
        const amount = Number(expense.expenseAmount || 0)
        total += amount
        const category = expense.expenseCategory || 'Others'
        byCategory[category] = (byCategory[category] || 0) + amount
        byMember[expense.expenseOwner] = (byMember[expense.expenseOwner] || 0) + amount
    })
    return { total, expenseCount: expenses.length, byCategory, byMember, startDate, endDate }
}

exports.insights = async (req, res) => {
    try {
        const question = String(req.body.question || '').trim()
        if (!question) return res.status(400).json({ message: 'question is required' })
        const financialData = await aggregateExpenses(req.groupId, req.body.startDate, req.body.endDate)
        if (!process.env.GEMINI_API_KEY) return res.status(503).json({ message: 'AI assistant is not configured. Add GEMINI_API_KEY to the server environment.', data: financialData })
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
        const endpoint = process.env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
            body: JSON.stringify({ systemInstruction: { parts: [{ text: 'You are PayWise Spending Assistant. Answer only questions about the supplied group spending data. Be concise, practical, and never invent figures.' }] }, contents: [{ role: 'user', parts: [{ text: JSON.stringify({ question, financialData }) }] }], generationConfig: { temperature: 0.2 } })
        })
        const payload = await response.json()
        if (!response.ok) return res.status(502).json({ message: payload.error?.message || 'Gemini request failed' })
        const answer = payload.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('')
        res.json({ status: 'success', answer: answer || 'No insight was returned.', data: financialData })
    } catch (err) { res.status(500).json({ message: err.message }) }
}
