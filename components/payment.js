const crypto = require('crypto')
const Razorpay = require('razorpay')
const model = require('../model/schema')

const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw Object.assign(new Error('Razorpay is not configured'), { status: 503 })
    return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
}

exports.createOrder = async (req, res) => {
    try {
        const user = await model.User.findOne({ emailId: req.user })
        if (!user) return res.status(401).json({ message: 'User does not exist' })
        if (user.role === 'admin' || user.isPremium === true) return res.json({ status: 'already_active', isPremium: true, role: user.role })
        const razorpay = getRazorpay()
        const amount = Number(process.env.PREMIUM_PRICE_PAISE || 49900)
        if (!Number.isInteger(amount) || amount <= 0) return res.status(500).json({ message: 'Invalid premium price configuration' })
        const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `premium_${Date.now()}`, notes: { userEmail: user.emailId } })
        await model.Payment.create({ userEmail: user.emailId, orderId: order.id, amount, currency: 'INR' })
        res.status(201).json({ status: 'success', orderId: order.id, amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID, name: 'PayWise Premium', email: user.emailId })
    } catch (err) { res.status(err.status || 500).json({ message: err.error?.description || err.message }) }
}

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body
        if (!orderId || !paymentId || !signature) return res.status(400).json({ message: 'Incomplete Razorpay payment response' })
        const payment = await model.Payment.findOne({ orderId, userEmail: req.user })
        if (!payment) return res.status(404).json({ message: 'Payment order not found' })
        const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${payment.orderId}|${paymentId}`).digest('hex')
        const valid = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
        if (!valid) return res.status(400).json({ message: 'Invalid payment signature' })
        const razorpay = getRazorpay()
        const paymentDetails = await razorpay.payments.fetch(paymentId)
        if (paymentDetails.order_id !== payment.orderId || paymentDetails.status !== 'captured') return res.status(400).json({ message: 'Payment is not captured yet' })
        await model.Payment.updateOne({ _id: payment._id }, { paymentId, status: 'paid', paidAt: new Date() })
        await model.User.updateOne({ emailId: req.user }, { isPremium: true, premiumSince: new Date() })
        res.json({ status: 'success', isPremium: true, message: 'Premium access activated' })
    } catch (err) { res.status(err.status || 502).json({ message: err.error?.description || err.message }) }
}

exports.webhook = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_WEBHOOK_SECRET) return res.status(503).send('Webhook secret not configured')
        const signature = req.headers['x-razorpay-signature']
        const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest('hex')
        if (!signature || expected !== signature) return res.status(400).send('Invalid webhook signature')
        const payload = JSON.parse(req.body.toString())
        if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
            const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity
            const orderId = entity?.order_id || entity?.id
            const payment = await model.Payment.findOne({ orderId })
            if (payment) {
                await model.Payment.updateOne({ _id: payment._id }, { paymentId: entity.id, status: 'paid', paidAt: new Date() })
                await model.User.updateOne({ emailId: payment.userEmail }, { isPremium: true, premiumSince: new Date() })
            }
        }
        res.json({ received: true })
    } catch (err) { res.status(400).send('Invalid webhook payload') }
}
