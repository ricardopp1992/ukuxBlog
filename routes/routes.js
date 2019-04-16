'use strict'

const express = require('express')
const multer = require('multer')
const path = require('path')

const routes = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, path.join(__dirname,'../imageTemp'))
    },
    filename: function(req, file, cb) {
        cb(null, `${file.fieldname}.jpg`)
    }
})

const upload = multer({storage}).single('image')

const connection = require('../database/connection')
const sendEmail = require('../models/nodemailer/index')
const { 
    getUser,
    insertArticle, 
    getArticles,
    getArticle, 
    deleteArticle,
    tokenAuthencitacion } = require('../models/users/index')


routes.get('/articles/:numArticles', async (req, res, next) => {
    const { numArticles } = req.params
    let articles

    try {
        if(numArticles == 'all'){
            articles = await getArticles(connection)

        } else {
            articles = await getArticles(connection, numArticles)

        }

        // application/json para permitir carácteres especiales (ñ é á)
        res.writeHead(200, { 'Content-type': 'application/json', "Accept-Encoding": "gzip, deflate" })
        res.end(JSON.stringify(articles))

    } catch (e) {
        res.writeHead(505, { 'Content-type': 'application/json' })
        res.end(JSON.stringify(e))
    }
})

routes.get('/article/:idArticle', async (req, res, next) => {
    let { idArticle } = req.params

    try {
        const resp = await getArticle(connection, idArticle)

        res.writeHead(200, { 'Conent-type': 'applicaction/json' })
        res.end(JSON.stringify(resp))
    } catch (e) {
        console.error(e)

        res.writeHead(400, { 'Content-type': 'application/json' })
        res.end(JSON.stringify(e))
    }
    console.log(idArticle)
    res.end(idArticle)
})

// routes.get('/articles/:author', async (req, res, next) => {
//     const { author } = req.params

//     try {
//         const articles = await getArticles(connection, author)
        
//         res.writeHead(200, { 'Content-type': 'application/json' })
//         res.end(JSON.stringify(articles))

//     } catch (e) {
//         res.writeHead(400, { 'Content-type': 'text/json' })
//         res.end(JSON.stringify(e))
//     }
    
// })

routes.delete('/delete-article/:articleId/', async (req, res, next) => {
    const { articleId } = req.params
    const { token } = req.body

    try {
        const resp = await deleteArticle(connection, articleId, token)

        res.writeHead(200, { 'Content-type': 'application/json' })
        res.end(JSON.stringify(resp))

    } catch (e) {
        console.log(e)

        res.writeHead(400, { 'Content-type': 'application/json' })
        res.end(JSON.stringify(e))
    }
})

routes.post('/authentication-token', async (req, res, next) => {
    // const token = req.body.token 
    const { token } = req.body 

    try {
        const resp = await tokenAuthencitacion(connection, token)

        res.writeHead(200, { 'Content-type': 'application/json' })
        res.end(JSON.stringify(resp))

    } catch (e) {
        res.writeHead(400, { 'Content-type': 'application/json' })
        res.end(JSON.stringify(e))
    }
})

routes.post('/user-authentication', async (req, res, next) => {
    const user = req.body
    console.log(user)
    
    try{
        const result = await getUser(connection, user)
        res.json(result)

    } catch (e){
        // handle the athorization denied
        res.writeHead(400, {'Content-Type': 'text/json'})
        res.end(JSON.stringify(e))
    }
    
})


routes.post('/insert-article', async (req, res, next) => {
    const article = req.body

    try {
        const result = await insertArticle(connection, article)
        res.writeHead(200, { 'Content-type': 'application/json' })
        res.end(JSON.stringify(result))

    } catch (e) {
        console.log(e)
        res.writeHead(400, { 'Content-type': 'text/json' })
        res.end(JSON.stringify(e))
    }
})

routes.post('/upload-image', async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.log(err)
          
          res.writeHead(200, { 'Content-type': 'application/json' })
          res.end(JSON.stringify({ resp: 'error', message: err }))

        } else if (err) {
            // An unknown error occurred when uploading.
            console.log(err)

            res.writeHead(200, { 'Content-type': 'application/json' })
            res.end(JSON.stringify({ resp: 'error', message: err }))
        }

        res.json({success: 'OK'})
    })
})

routes.post('/send-message', async (req, res, next) => {
    const { name, company, phone, email, message } = req.body

    try{
        const respEmail = await sendEmail(email, message, company)
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify(respEmail))

    } catch(e) {
        console.log(e)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(e))
    }
})


module.exports = routes