
const helper = require("../helper")
const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "default secret"

function auth(req, res, next) {
    const token = (req.headers["authorization"] || "").split("Bearer ")[1]
    if (!token) {
        helper.sendTokenFail(res, "your token is wrong")
        return
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            helper.sendTokenFail(res)
        } else {
            req.decoded = decoded
            next()
        }
    })
}

module.exports = auth
