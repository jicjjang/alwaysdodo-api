require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('jwt-secret', process.env.JWT_SECRET)

/* router */
require("./router")(app)

app.listen(3000, () => {
    console.log('starting server :: port 3000');
});