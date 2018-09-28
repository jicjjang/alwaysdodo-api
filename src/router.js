const jwt = require('jsonwebtoken')
const db = require("async-db-adapter")
const helper = require("./helper")
const authMiddleware = require('./auth')
require('dotenv').config('./../')

const pool = db.create({
    adapter: "mysql2",
    pool: true,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

/*

*/

module.exports = function (app) {

    /**
     * AUTH : public 
     * GET /registries -> 전체 레지스트리 출력
     */

    app.get('/registries', async (req, res) => {
        try {
            const rows = await pool.select("SELECT * FROM registries")
            helper.sendSuccess(req, res, rows)
        } catch (err) {
            helper.sendFailure(req, res, err)
        }
    });

    /**
     * 관리자 권한
     * POST /registries -> name, value 입력받고 데이터 추가가능
     */

    app.post('/registries', authMiddleware, async (req, res) => {
        const body = req.body

        try {
            const rows = await pool.query(`INSERT INTO registries (name, value) VALUES ('${body.name}', '${body.value}')`)
            helper.sendSuccess(req, res, {
                success: true,
                message: "success insert"
            })
        } catch (err) {
            helper.sendFailure(req, res, err)
        }
    });

    /**
     * 관리자 권한
     * PUT /registries/:id -> name, value 입력받고 데이터 수정
     */

    app.put('/registries/:id', authMiddleware, async (req, res) => {
        const id = req.params.id
        const {
            name,
            value
        } = req.body

        try {
            if (name && value) {
                const rows = await pool.query(`UPDATE registries SET ${name ? `name='${name}',` : ""}${value ? ` value='${value}'` : ""} WHERE id=${id}`)

                if (0 != rows.affectedRows) {
                    helper.sendSuccess(req, res, {
                        success: true,
                        message: "success update"
                    })
                } else {
                    helper.sendFailure(req, res, helper.error("400", "invalidRequest"))
                }
            } else {
                helper.sendFailure(req, res, helper.error("400", "invalidRequest"))
            }
        } catch (err) {
            helper.sendFailure(req, res, err)
        }
    });

    /**
     * 관리자 권한
     * DELETE /registries/:id -> 해당 레지스트리 삭제
     */

    app.delete('/registries/:id', authMiddleware, async (req, res) => {
        const id = req.params.id

        try {
            const rows = await pool.query(`DELETE FROM registries WHERE id=${id}`)

            if (0 != rows.affectedRows) {
                helper.sendSuccess(req, res, {
                    success: true,
                    message: "success delete"
                })
            } else {
                helper.sendFailure(req, res, helper.error("400", "invalidRequest"))
            }
        } catch (err) {
            helper.sendFailure(req, res, err)
        }
    });

    /**
     * POST /auth/login -> username / password 처리 -> JWT 토큰 반환, exp(24시간?) 반드시 추가할 것!
     */

    app.post('/auth/login', async (req, res) => {
        const {
            username,
            password
        } = req.body

        if (!username || !password) {
            helper.sendFailure(req, res, helper.error("400", "invalidRequest"))
            return
        }

        const secret = req.app.get('jwt-secret')
        jwt.sign({
                username: username,
                password: password
            },
            secret, {
                expiresIn: '1d'
            },
            (err, token) => {
                if (err) {
                    helper.sendFailure(req, res, helper.error("500", "something wrong.."))
                } else {
                    helper.sendSuccess(req, res, {
                        success: true,
                        token: token
                    })
                }
            })

    });
};