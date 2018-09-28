const jwt = require('jsonwebtoken')
const db = require("async-db-adapter")
const helper = require("./helper")
const authMiddleware = require('./auth')

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
            helper.sendSuccess(req, res, rows.map(({id, name, value}) => {
                try {
                    return {id, name, value: JSON.parse(value)}
                } catch (e) {
                    return {id, name, value}
                }
            }))
        } catch (err) {
            helper.sendFailure(req, res, err)
        }
    });

    /**
     * 관리자 권한
     * POST /registries -> name, value 입력받고 데이터 추가가능
     */
    app.post('/registries', authMiddleware, async ({body: {name, value}}, res) => {
        try {
            await pool.query(`INSERT INTO registries (name, value) VALUES (?, ?)`, [name, JSON.stringify(value)])
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

    app.put('/registries/:id', authMiddleware, async ({params: {id}, body: {name, value}}, res) => {
        if (!name || !value) {
            helper.sendFailure(req, res, helper.error("400", "invalidRequest"))
            return
        }
        try {
            await pool.query(`UPDATE registries SET name=?, value =? WHERE id=?`, [name, JSON.stringify(value), id])
            helper.sendSuccess(req, res, {
                success: true,
                message: "success update"
            })
        } catch (err) {
            helper.sendFailure(req, res, err)
        }
    });

    /**
     * 관리자 권한
     * DELETE /registries/:id -> 해당 레지스트리 삭제
     */

    app.delete('/registries/:id', authMiddleware, async ({params: {id}}, res) => {
        try {
            await pool.query(`DELETE FROM registries WHERE id = ?`, [id])
            helper.sendSuccess(req, res, {
                success: true,
                message: "success delete"
            })
        } catch (err) {
            helper.sendFailure(req, res, err)
        }
    });

    /**
     * POST /auth/login -> username / password 처리 -> JWT 토큰 반환, exp(24시간?) 반드시 추가할 것!
     */

    app.post('/auth/login', async ({body: {username, password}}, res) => {
        if (!username || !password || username !== process.env.MANAGER_USERNAME || password !== process.env.MANAGER_PASSWORD) {
            helper.sendFailure(req, res, helper.error("400", "invalidRequest"))
            return
        }
        const secret = req.app.get('jwt-secret')
        try {
            const token = await new Promise((resolve, reject) => {
                jwt.sign({
                        username,
                    },
                    secret, {
                        expiresIn: '1d'
                    },
                    (err, token) => {
                        if (err) {
                            return reject(err)
                        }
                        resolve(token)
                    }
                )
    
            })    
            helper.sendSuccess(req, res, {
                success: true,
                token: token
            })
        } catch (e) {
            helper.sendFailure(req, res, helper.error("500", "something wrong.."))
        }
    });
};