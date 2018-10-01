
const jwt = require("jsonwebtoken")
const helper = require("./helper")
const auth = require("./middlewares/auth")

const MANAGER_USERNAME = process.env.MANAGER_USERNAME || ""
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || ""

const JWT_SECRET = process.env.JWT_SECRET || "default secret"

module.exports = function (app, connection) {

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

    /**
     * 관리자 권한
     * PUT /registries/:id -> name, value 입력받고 데이터 수정
     */

    app.put("/registries/:id", auth, async ({params: {id}, body: {name, value}}, res) => {
        if (!name || !value) {
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
     * POST /auth/login -> username / password 처리 -> JWT 토큰 반환, exp(24시간?) 반드시 추가할 것!
     */
    app.get("/auth/user", auth, async ({decoded}, res) => {
        res.json({
            success: true,
            user: {
                username: decoded.username,
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
