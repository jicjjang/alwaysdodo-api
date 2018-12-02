
exports.sendFailure = function (res, err) {
    var code = (err.code) ? err.code : err.name
    res.writeHead(400, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    var output = {
        success: false,
        error: code,
        message: err.message
    }
    res.end(JSON.stringify(output))
}

exports.error = function (code, message) {
    var e = new Error(message)
    e.code = code
    return e
}

exports.sendTokenFail = function (res, message) {
    res.writeHead(403, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    var output = {
        success: false,
        message: message || "invalide token"
    }
    res.end(JSON.stringify(output))
}

exports.sendServerFail = function (res, message) {
    res.writeHead(500, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    var output = {
        success: false,
        message: message || "Internal server error"
    }
    res.end(JSON.stringify(output))
}

exports.sendOauthUrl = function (res, url, message) {
    res.writeHead(302, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    var output = {
        success: false,
        url: url || "",
        message: message || ""
    }
    res.end(JSON.stringify(output))
}
