
const jwt = require("jsonwebtoken")
const helper = require("./helper")
const auth = require("./middlewares/auth")
const { oauth, oauthClient } = require("./middlewares/oauth")
const multer = require("multer")
const multerS3 = require("multer-s3")
const datefns = require("date-fns")

const { google } = require('googleapis');

const MANAGER_USERNAME = process.env.MANAGER_USERNAME || ""
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || ""

const JWT_SECRET = process.env.JWT_SECRET || "default secret"

const AWS_S3_ATTACHMENT = process.env.AWS_S3_ATTACHMENT || ""

const GOOGLE_SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || ""

module.exports = function (app, connection, s3) {

    const uploader = multer({
        storage: multerS3({
            s3,
            bucket: AWS_S3_ATTACHMENT,
            acl: "public-read",
            key: (req, file, cb) => {
                const chunks = file.originalname.split(".")
                const ext = chunks.pop()
                const filename = chunks.join(".").toLowerCase().replace(/[^a-z0-9_]/g, "_")
                cb(null, `attachments/${filename}_${datefns.format(new Date(), "YYMMDD_HHmmss")}.${ext}`)
            },
        })
    })

    app.get("/", async (req, res) => {
        res.json({
            success: true,
            message: "pong",
        })
    })

    /**
     * AUTH : public 
     * GET /registries -> 전체 레지스트리 출력
     */

    app.get("/registries", async (req, res) => {
        
        try {
            const rows = await connection.select("SELECT * FROM registries")
            res.json({
                success: true,
                registries: rows.map(({id, name, value}) => {
                    try {
                        return {id, name, value: JSON.parse(value)}
                    } catch (e) {
                        return {id, name, value}
                    }
                })
            })
        } catch (err) {
            helper.sendFailure(res, err)
        }
    })

    /**
     * 관리자 권한
     * POST /registries -> name, value 입력받고 데이터 추가가능
     */
    app.post("/registries", auth, async ({body: {name, value}}, res) => {
        try {
            await connection.query("INSERT INTO registries (name, value) VALUES (?, ?)", [name, JSON.stringify(value)])
            res.json({
                success: true,
                message: "success insert"
            })
        } catch (err) {
            helper.sendFailure(res, err)
        }
    })

    app.post("/attachments", auth, uploader.single("attachment"), async (req, res) => {
        try {
            res.json({
                success: true,
                attachment: {
                    path: req.file.location,
                },
            })
        } catch (err) {
            helper.sendFailure(res, err)
        }
    })

    /**
     * 관리자 권한
     * PUT /registries/:id -> name, value 입력받고 데이터 수정
     */

    app.put("/registries/:id", auth, async ({params: {id}, body: {name, value}}, res) => {
        if (!name || typeof value === "undefined") {
            helper.sendFailure(res, helper.error("400", "invalidRequest"))
            return
        }
        try {
            await connection.query("UPDATE registries SET name=?, value =? WHERE id=?", [name, JSON.stringify(value), id])
            res.json({
                success: true,
                message: "success update"
            })
        } catch (err) {
            helper.sendFailure(res, err)
        }
    })

    /**
     * 관리자 권한
     * DELETE /registries/:id -> 해당 레지스트리 삭제
     */

    app.delete("/registries/:id", auth, async ({params: {id}}, res) => {
        try {
            await connection.query("DELETE FROM registries WHERE id = ?", [id])
            res.json({
                success: true,
                message: "success delete"
            })
        } catch (err) {
            helper.sendFailure(res, err)
        }
    })

    /**
     * TODO
     * QR Generate = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=URL`
     * 
     * 1. GET Docs
     * https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get?hl=ko&apix_params=%7B%22spreadsheetId%22%3A%221W3PE7mQREqAD6mctVJWINxuARCZ5iEcRVj2-QGvatT8%22%2C%22range%22%3A%22A3%3AF37%22%2C%22majorDimension%22%3A%22COLUMNS%22%7D

     * 2. POST Docs
     * https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update?hl=ko&apix_params=%7B%22spreadsheetId%22%3A%221W3PE7mQREqAD6mctVJWINxuARCZ5iEcRVj2-QGvatT8%22%2C%22range%22%3A%22H5%3AH5%22%2C%22valueInputOption%22%3A%22RAW%22%2C%22resource%22%3A%7B%22values%22%3A%5B%5B%22O%22%5D%5D%7D%7D
     */
    app.post("/qr/check", [auth, oauth], async ({body: {email}}, res) => {
      let userIndex = 0;
      let username = '';
      const sheets = google.sheets('v4');

      try {
        const retrieveResponse = await sheets.spreadsheets.values.get(
          {
            auth: oauthClient,
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            majorDimension: 'COLUMNS',
            range: 'A3:B100',
          });

        if (retrieveResponse && retrieveResponse.status === 200) {
          userIndex = retrieveResponse.data.values[1].findIndex(val => val === email);
          if (userIndex < 0) {
              helper.sendServerFail(res, "신청하지 않은 사용자입니다.");
              return -1;
          }
          username = retrieveResponse.data.values[0][userIndex];
        }
      } catch (e) {
        helper.sendServerFail(res, "spreadsheet 조회 실패");
        return -1;
      }
      
      try {
        const updateResponse = await sheets.spreadsheets.values.update({
          auth: oauthClient,
          spreadsheetId: GOOGLE_SPREADSHEET_ID,
          range: `H${userIndex+3}:H${userIndex+3}`,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [[ "O" ]] }
        });

        if (updateResponse.status === 200) {
          return res.json({
            success: true,
            user: {
              username,
              email
            }
          })
        }
      } catch(e) {
        helper.sendServerFail(res, "spread 업데이트 실패");
        return -1;
      }
      helper.sendServerFail(res, "알 수 없는 에러");
      return -1;
    })

    
    /**
     * POST /auth/login -> username / password 처리 -> JWT 토큰 반환, exp(24시간?) 반드시 추가할 것!
     */
    app.get("/auth/user", auth, async ({decoded}, res) => {
        res.json({
            success: true,
            user: {
                username: decoded ? decoded.username : '',
            },
        })
    })
    app.post("/auth/logout", async (_, res) => {
        // todo 
        res.json({
            success: true,
        })
    })
    app.post("/auth/login", async ({body: {username, password}}, res) => {
        if (!username || !password || username !== MANAGER_USERNAME || password !== MANAGER_PASSWORD) {
            helper.sendFailure(res, helper.error("400", "invalidRequest"))
            return
        }
        try {
            const token = await new Promise((resolve, reject) => {
                jwt.sign(
                    {
                        username,
                    },
                    JWT_SECRET,
                    {
                        expiresIn: "1d"
                    },
                    (err, token) => {
                        if (err) {
                            return reject(err)
                        }
                        resolve(token)
                    }
                )    
            })
            res.json({
                success: true,
                token: token
            })
        } catch (e) {
            helper.sendFailure(res, helper.error("500", "something wrong.."))
        }
    })
}
