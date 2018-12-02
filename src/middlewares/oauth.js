
const {google} = require('googleapis')
const path = require('path')
const fs = require('fs')

const helper = require("../helper")

const keyfile = path.resolve(__dirname, '../../credentials.json')
const keys = JSON.parse(fs.readFileSync(keyfile))
const scopes = ['https://www.googleapis.com/auth/spreadsheets']

// Create an oAuth2 client to authorize the API call
const oauthClient = new google.auth.OAuth2(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
)

// Generate the url that will be used for authorization
const oauthAuthorizeUrl = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
})

const oauth = (req, res, next) => {
    const code = req.body.code

    if (code) {
        oauthClient.getToken(code, (err, tokens) => {
            if (err) {
                helper.sendFailure(res, "invalide oauth token")
                return -1
            }

            oauthClient.credentials = tokens
            next()
            return 1
        })
    } else {
        helper.sendOauthUrl(res, oauthAuthorizeUrl)
        return -1
    }
}

module.exports = {
  oauth,
  oauthClient,
  oauthAuthorizeUrl
}
