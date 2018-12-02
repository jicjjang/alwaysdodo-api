
require("dotenv").config(process.cwd())

const aws = require("aws-sdk")
const db = require("async-db-adapter")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const app = express()

// constants
const PORT = parseInt(process.env.PORT || "3001")

const DB_HOST = process.env.DB_HOST || "localhost"
const DB_USER = process.env.DB_USER || "root"
const DB_PASSWORD = process.env.DB_PASSWORD || ""
const DB_DATABASE = process.env.DB_DATABASE || "alwaysdodo"
const DB_POOLSIZE = parseInt(process.env.DB_POOLSIZE || "10")

const connection = db.create({
    adapter: "mysql2",
    pool: true,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true,
    connectionLimit: DB_POOLSIZE,
    queueLimit: 0,
})

const s3 = new aws.S3()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

/* router */
require("./router")(app, connection, s3)

app.listen(PORT, () => {
    console.log(`Server Started on localhost:${PORT} 🚀`)
})
