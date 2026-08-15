const model = require('../model/schema')

exports.requirePremium = async (req, res, next) => {
    try {
        const email = req.user
        const user = await model.User.findOne({ emailId: email }, { isPremium: 1, role: 1, premiumSince: 1 })
        if (!user) return res.status(401).json({ message: 'User does not exist' })
        if (user.role !== 'admin' && user.isPremium !== true) return res.status(403).json({ message: 'Premium access required. Complete payment to unlock this feature.' })
        req.premiumUser = user
        next()
    } catch (err) {
        res.status(500).json({ message: 'Unable to verify premium access' })
    }
}

exports.requireGroupMember = async (req, res, next) => {
    try {
        const groupId = req.body.groupId || req.body.id || req.query.groupId
        if (!groupId) return res.status(400).json({ message: 'groupId is required' })
        const group = await model.Group.findOne({ _id: groupId })
        if (!group) return res.status(404).json({ message: 'Group not found' })
        if (!group.groupMembers.includes(req.user)) return res.status(403).json({ message: 'You are not a member of this group' })
        req.group = group
        req.groupId = groupId
        next()
    } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid group id' })
        res.status(500).json({ message: 'Unable to verify group access' })
    }
}
