var dotenv = require('dotenv')
var express = require('express')
var logger = require('./helper/logger')
var requestLogger = require('./helper/requestLogger')
var apiAuth = require('./helper/apiAuthentication')
var cors = require('cors')
var bodyParser = require('body-parser')

const path = require('path');
dotenv.config()

var usersRouter = require('./routes/userRouter')
var groupRouter = require('./routes/groupRouter')
var expenseRouter = require('./routes/expenseRouter')
var budgetRouter = require('./routes/budgetRouter')
var aiRouter = require('./routes/aiRouter')
var reportRouter = require('./routes/reportRouter')
var paymentRouter = require('./routes/paymentRouter')
var paymentController = require('./components/payment')
var model = require('./model/schema')

var app = express()
app.use(cors())
app.post('/api/payments/v1/webhook', bodyParser.raw({ type: 'application/json' }), paymentController.webhook)
app.use(express.json())
app.use(requestLogger)

app.use('/api/users', usersRouter)
app.use('/api/group', apiAuth.validateToken, groupRouter)
app.use('/api/expense', apiAuth.validateToken, expenseRouter)
app.use('/api/budget', budgetRouter)
app.use('/api/ai', aiRouter)
app.use('/api/reports', reportRouter)
app.use('/api/payments', paymentRouter)

// Serve static React frontend
const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

// Fallback to React index.html for SPA routing
app.get('*', (req, res) => {
    // Don't serve HTML for API routes that don't exist (let them fall through to error handler)
    if (!req.path.startsWith('/api')) {
        const indexPath = path.join(buildPath, 'index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                logger.error(`Error serving index.html: ${err.message}`)
                res.status(500).json({
                    status: 'fail',
                    message: 'Error loading application'
                })
            }
        });
    } else {
        // Invalid API route
        logger.error(`[Invalid Route] ${req.originalUrl}`)
        res.status(404).json({
            status: 'fail',
            message: 'Invalid path'
        })
    }
});

const port = process.env.PORT || 3001
model.dbConnection.then(() => {
    console.log('DB Connected')
    app.listen(port, () => {
        console.log(`Backend connected | http://localhost:${port}`)
    })
}).catch(err => {
    console.error(`Database connection failed: ${err.message}`)
    process.exitCode = 1
})
