
require('dotenv').config(process.cwd())

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

/* router */
require("./router")(app)

app.listen(3000, () => {
    console.log('starting server :: port 3000');
});
