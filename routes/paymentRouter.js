const express = require('express')
const controller = require('../components/payment')
const apiAuth = require('../helper/apiAuthentication')
const router = express.Router()
router.post('/v1/order', apiAuth.validateToken, controller.createOrder)
router.post('/v1/verify', apiAuth.validateToken, controller.verifyPayment)
module.exports = router
