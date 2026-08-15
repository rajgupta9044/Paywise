var jwt = require('jsonwebtoken')
var logger = require('./logger')

exports.generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}


exports.validateToken = (req, res, next) => {
    //Bypass Authentication when DISABLE_API_AUTH is set in the env file for dev purpose only 
    if (process.env.DISABLE_API_AUTH == "true") {
        next()
    } else {
        //Checking if authorization is present in the header if not present then access is forbidden 
        if (req.headers["authorization"] == null) {
            logger.error(`URL : ${req.originalUrl} | API Authentication Fail | message: Token not present`)
            res.status(403).json({
                message: "Token not present"
            })
        } else {
            //getting token from request header 
            const authHeader = req.headers["authorization"]
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                logger.error(`URL : ${req.originalUrl} | API Authentication Fail | message: Token not present`)
                return res.status(403).json({
                    message: "Token not present"
                })
            }

            const token = authHeader.split(" ")[1]

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    logger.error(`URL : ${req.originalUrl} | API Authentication Fail | message: Invalid Token`)
                    return res.status(403).json({
                        message: "Invalid Token"
                    })
                }
                req.user = user
                next()
            })
        }
    }
}


//Validation function to check if the user is same as the token user 
exports.validateUser = (user, emailId) => {
    if (process.env.DISABLE_API_AUTH != "true" &&
        user != emailId
    ) {
        var err = new Error("Access Denied")
        err.status = 403
        throw err
    } else
        return true
}