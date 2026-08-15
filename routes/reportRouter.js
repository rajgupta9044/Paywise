const express = require('express')
const controller = require('../components/report')
const apiAuth = require('../helper/apiAuthentication')
const premium = require('../helper/premiumAuthentication')
const router = express.Router()
router.post('/v1/summary', apiAuth.validateToken, premium.requirePremium, premium.requireGroupMember, controller.summary)
router.post('/v1/csv', apiAuth.validateToken, premium.requirePremium, premium.requireGroupMember, controller.csv)
router.post('/v1/pdf', apiAuth.validateToken, premium.requirePremium, premium.requireGroupMember, controller.pdf)
module.exports = router
