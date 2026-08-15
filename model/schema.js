var mongoose = require('mongoose')

const dbConnection = mongoose.connect(process.env.MONGODB_URI, 
//     {
//     maxPoolSize: 50,
//     wtimeoutMS: 2500,
//     useNewUrlParser: true
// }
)

const User = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    favGroup: {
        type: Array
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    premiumSince: {
        type: Date
    }
})

const Group = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupDescription: {
        type: String
    },
    groupCurrency: {
        type: String,
        default: "INR"
    },
    groupOwner: {
        type: String,
        required: true
    },
    groupMembers: {
        type: Array,
        required: true
    },
    groupCategory: {
        type: String,
        default: "Others"
    },groupTotal: {
        type: Number, 
        default: 0
    },
    split: {
        type: Array
    },
})

const Expense = new mongoose.Schema({
    groupId: {
        type: String,
        required: true
    },
    expenseName: {
        type: String,
        required: true
    },
    expenseDescription: {
        type: String,
    },
    expenseAmount: {
        type: Number,
        required: true
    },
    expenseCategory:{
        type: String,
        default: "Others"
    },
    expenseCurrency:{
        type: String,
        default: "INR"
    },
    expenseDate:{
        type: Date,
        default: Date.now
    },
    expenseOwner: {
        type: String,
        required: true
    },
    expenseMembers: {
        type: Array,
        required: true
    },
    expensePerMember: {
        type: Number,
        required: true
    },
    expenseType: {
        type: String, 
        default: "Cash"
    }
})

const Settlement = new mongoose.Schema({
    groupId:{
        type: String,
        required: true
    },
    settleTo:{
        type:String,
        required: true
    },
    settleFrom:{
        type:String,
        required: true
    }, 
    settleDate:{
        type:String,
        required: true
    },
    settleAmount:{
        type:Number, 
        required: true
    }
}, { timestamps: true })

const Budget = new mongoose.Schema({
    groupId: { type: String, required: true, index: true },
    name: { type: String, default: "Monthly Budget" },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    categoryBudgets: [{
        category: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
    }],
    createdBy: { type: String, required: true }
}, { timestamps: true })

const Payment = new mongoose.Schema({
    userEmail: { type: String, required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    paidAt: { type: Date }
}, { timestamps: true })

module.exports.Expense = mongoose.model('expense', Expense)
module.exports.User = mongoose.model('user', User)
module.exports.Group = mongoose.model('group', Group)
module.exports.Settlement = mongoose.model('settlement', Settlement)
module.exports.Budget = mongoose.model('budget', Budget)
module.exports.Payment = mongoose.model('payment', Payment)
module.exports.dbConnection = dbConnection
