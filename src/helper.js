exports.sendFailure = function (req, res, err) {
    var code = (err.code) ? err.code : err.name;
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

exports.sendSuccess = function (req, res, datas) {
    res.writeHead(200, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    res.end(JSON.stringify(datas))
}

exports.error = function (code, message) {
    var e = new Error(message)
    e.code = code
    return e
}

exports.sendTokenFail = function (req, res) {
    res.writeHead(403, {
        "Content-Type": "application/json;charset=UTF-8"
    })

    var output = {
        success: false,
        message: "invalide token"
    }
    res.end(JSON.stringify(output))
}