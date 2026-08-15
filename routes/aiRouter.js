const express = require('express')
const controller = require('../components/ai')
const apiAuth = require('../helper/apiAuthentication')
const premium = require('../helper/premiumAuthentication')
const router = express.Router()
router.post('/v1/expense-insights', apiAuth.validateToken, premium.requirePremium, premium.requireGroupMember, controller.insights)
module.exports = router
