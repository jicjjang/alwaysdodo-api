
require("dotenv").config(process.cwd())

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const app = express()

const PORT = parseInt(process.env.PORT || "3000")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

/* router */
require("./router")(app)

app.listen(PORT, () => {
    console.log(`Server Started on localhost:${PORT} 🚀`)
})
