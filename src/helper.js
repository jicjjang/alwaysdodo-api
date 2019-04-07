
exports.sendFailure = (res, err) => {
    const code = (err.code) ? err.code : err.name
    res.writeHead(400, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    const output = {
        success: false,
        error: code,
        message: err.message
    }
    res.end(JSON.stringify(output))
}

exports.error = (code, message) => {
    const e = new Error(message)
    e.code = code
    return e
}

exports.sendTokenFail = (res, message) => {
    res.writeHead(403, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    const output = {
        success: false,
        message: message || "invalid token"
    }
    res.end(JSON.stringify(output))
}

exports.sendServerFail = (res, message) => {
    res.writeHead(500, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    const output = {
        success: false,
        message: message || "Internal server error"
    }
    res.end(JSON.stringify(output))
}

exports.sendOauthUrl = (res, url, message) => {
    res.writeHead(302, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    const output = {
        success: false,
        url: url || "",
        message: message || ""
    }
    res.end(JSON.stringify(output))
}
