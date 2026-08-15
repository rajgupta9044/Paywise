const express = require('express')
const controller = require('../components/budget')
const apiAuth = require('../helper/apiAuthentication')
const premium = require('../helper/premiumAuthentication')

const router = express.Router()
router.use(apiAuth.validateToken, premium.requirePremium, premium.requireGroupMember)
router.post('/list', controller.list)
router.post('/add', controller.create)
router.put('/edit', controller.update)
router.delete('/delete', controller.remove)
router.post('/summary', controller.summary)
module.exports = router
