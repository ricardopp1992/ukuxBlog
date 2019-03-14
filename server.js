'use strict'

const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')

const routes = require('./routes/routes')
const conf = require('./conf')

const app = express()
const port = conf.port

const server = http.createServer(app)

// SETING UP SERVER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors())

app.use(express.static('public'))

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

//     next();
// })

//ROUTES
app.use('/', routes)

// HANDLING ERRORS
app.use((err, req, res, next) => {
    console.error(err.message)

})

if (!module.parent){
    server.listen(port, () => {
        console.log(`Server listen on port ${port}`)
    })
}
