const helper = require("./helper")
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const token = (req.headers['Authorization'] || "").split("Bearer ")[1]
    if (!token) {
        helper.sendTokenFail(res)
        return
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            helper.sendTokenFail(res)
        } else {
            req.decoded = decoded
            next()
        }
    })
}

module.exports = authMiddleware