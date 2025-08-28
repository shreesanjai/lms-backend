const jwt = require('jsonwebtoken');

const dotenv = require('dotenv')
dotenv.config();

const generateToken = (user) => {
    var token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })
    return token;
}

module.exports = { generateToken }