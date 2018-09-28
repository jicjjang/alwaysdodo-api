const helper = require("./helper")
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.query.token

    if (!token) {
        helper.sendTokenFail(req, res)
        return
    }

    jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
            helper.sendTokenFail(req, res)
        } else {
            req.decoded = decoded
            next()
        }
    })
}

module.exports = authMiddleware