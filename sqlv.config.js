
require("dotenv").config(process.cwd())

const DB_HOST = process.env.DB_HOST || "localhost"
const DB_USER = process.env.DB_USER || "root"
const DB_PASSWORD = process.env.DB_PASSWORD || ""
const DB_DATABASE = process.env.DB_DATABASE || "alwaysdodo"

module.exports = {
  adapter: "mysql2",
  host: DB_HOST,
  database: DB_DATABASE,
  user: DB_USER,
  password: DB_PASSWORD,
}
