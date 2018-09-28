const helper = require("./helper")
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const token = (req.headers['Authorization'] || "").split("Bearer ")[1]
    if (!token) {
        helper.sendTokenFail(res)
        return
    }

    jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
            helper.sendTokenFail(res)
        } else {
            req.decoded = decoded
            next()
        }
    })
}

module.exports = authMiddleware