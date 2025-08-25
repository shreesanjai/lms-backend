const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
const { sendError } = require('../utils/responses');
dotenv.config()

const verifyToken = (req, res, next) => {
    var token;

    var authHeaders = req.headers.Authorization || req.headers.authorization

    if (authHeaders && authHeaders.startsWith("Bearer")) {
        token = authHeaders.split(" ")[1]

        if (!token)
            res.status(401).json({
                message: "No token, Authorization Denied."
            })

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decode
            next()
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return sendError(res, 'Token expired', 401);
            }
            if (error.name === 'JsonWebTokenError') {
                return sendError(res, 'Invalid token', 401);
            }
            return sendError(res, 'Authentication failed', 401);
        }
    }
    else {
        return sendError(res, 'Invalid token', 401);
    }


}

module.exports = { verifyToken }