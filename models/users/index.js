'use strict'

const uuid = require('uuid/v4')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')


function getUser(connection, user) {
    return new Promise((resolve, reject) => {
        const { username, password } = user

        const selectUser = 'SELECT * FROM usuario WHERE username = ? AND password = ?'
    
        connection.query(selectUser, [username, password], async (err, results, fields) => {
            if (Boolean(err)) {
                reject({ resp: '404', message: err })
                
            } else if (!results.length) {
                reject({ resp: '404', message: 'not user' })

            } else {
                // crear el token desde aquí
                const token = uuid()
    
                try {
                    const respToken = await setToken(connection, username, token)
                    
                    if (respToken.resp){
                        resolve({ resp: '200', message: 'OK', token })
    
                    }
    
                } catch (e) {
                    reject({ resp: '500', message: 'token problem' })
                }
            }
        })
    })
}

function insertArticle(connection, article){
    return new Promise( async (resolve, reject) => {
        const { token, title, date, content, categoryArticle} = article

        try {
            const isAuthenticated = await tokenAuthencitacion(connection, token)
            const author = isAuthenticated.author

            if (isAuthenticated.resp) {
                try{
                    await createSmallImage()

                    fs.readFile(path.join(__dirname, '../../imageTemp/image.jpg'), function (err, data) {                        
                        const insertArticle = 'INSERT INTO articulo (titulo, contenido, fecha, autor, imagen, imagen_p, categoria ) VALUES (?, ?, ?, ?, ?, ?, ?)'

                        getSmallImageData((dataSmall) => {
                            console.log(dataSmall)
                            connection.query(insertArticle, [title, content, date, author, data, dataSmall, categoryArticle], (err, results, fields) => {
                                if(Boolean(err)){
                                    reject({ resp: false, message: err.message})
    
                                } else if(results.affectedRows){
                                    resolve({ resp: true, message: 'article inserted successful' })
    
                                } else {
                                    reject({ resp: false, message: 'the article insertion has failed' })
    
                                }
                            })

                        })
                        
                    })
                }catch (e) {
                    reject(e)
                }
            }

        } catch (e) {
            reject({ resp: false, message: 'cannot authenticate the user' })
        }
    })
}

function getArticles(connection, numArticles = false){ 
    return new Promise((resolve, reject) => {
        let selectArticles

        if(numArticles){
            selectArticles = 'SELECT id, titulo, contenido, autor, imagen_p as imagen, categoria  FROM articulo ORDER BY fecha DESC LIMIT ?'
            numArticles = parseInt(numArticles)

        } else {
            selectArticles = 'SELECT id, titulo, contenido, autor, imagen_p as imagen, categoria FROM articulo WHERE ? ORDER BY fecha DESC'
            numArticles = 1

        }

        connection.query(selectArticles, [numArticles], (err, rows, fields) => {
            if (err) {
                reject({ resp: false, message: err.message})
            }
            
            resolve(rows)
        })
    })
}

function getArticle(connection, idArticle){
    return new Promise((resolve, reject) => {
        const select = 'SELECT * FROM articulo WHERE id = ?'
    
        connection.query(select, [idArticle], (err, rows, fields) => {
            if (err) {
                reject(err)      

            } else if(!Boolean(rows.length)){
                reject({message: 'No hay resultados'})

            } else {
                resolve(rows)
            }
        })
    })
}

function deleteArticle(connection, articleId, token){
    return new Promise( async (resolve, reject) => {
        try {
            const isAuthenticated = await tokenAuthencitacion(connection, token)
    
            if (isAuthenticated.resp){
                const removeArticle = 'DELETE FROM articulo WHERE id = ?'
                
                connection.query(removeArticle, [articleId], (err, result, fields) => {
                    if (Boolean(err)){
                        reject({isDeleted: false, message: err.message})
    
                    }else if(result.affectedRows == 1){
                        resolve({ isDeleted: true, message: 'delete successful' })
    
                    }else {
                        reject({isDeleted: false, message: 'something happen'})
                    }
                })
            }
    
        } catch (e) {
            reject({ resp: false, message: e.message })
        }
    })
}

function setToken(connection, username, token){
    return new Promise((resolve, reject) => {
        const insertSql = 'UPDATE usuario SET token = ? WHERE username = ?'
    
        connection.query(insertSql, [token, username], (err, rows, fields) => {
            if(err){
                reject(err)
            }
            resolve({resp: true})
        })

    })
}

function tokenAuthencitacion(connection, token){
    return new Promise((resolve, reject) => {
        const findToken = 'SELECT * FROM usuario WHERE token = ?'
        
        connection.query(findToken, [token], (err, rows, fields) => {
            if(err) {
                reject(e)
            }

            if (rows.length) {
                resolve({ resp: true, author: rows[0].nombre ,message: 'authentication successful' })

            } else {
                reject({ resp: false })
            }
        })
    })
}

function createSmallImage(){
    return new Promise((res, rej) => {
        const imageP = fs.createWriteStream(path.join(__dirname, '../../imageTemp/image_p.jpeg'))

        fs.readFile(path.join(__dirname, '../../imageTemp/image.jpg'), async (err, data) => {
            if(Boolean(err)) {
                console.error(err)
                rej()
            } else if (data.length > 1000000) {
                console.log('greater than 1Mb: ', data.length)

                try{
                    let dataBuff = await sharp(path.join(__dirname, '../../imageTemp/image.jpg'))
                    .jpeg({
                        quality: 20
                    })
                    .toBuffer()
    
                    imageP.write(dataBuff)
                    dataBuff = null
                    imageP.destroy()
                    res()

                } catch(e) {
                    console.error(e)
                    rej()
                }
                
                
            } else {
                console.log('lower than 1Mb: ', data.length)

                imageP.write(data)
                imageP.destroy()
                res()
            }
        })
    })
}

function getSmallImageData (cb){
    fs.readFile(path.join(__dirname, '../../imageTemp/image_p.jpeg'), (err, data) => {
        if(err){
            console.error(err)
        }

        cb(data)
    })
}

module.exports = {
    getUser,
    insertArticle,
    getArticles,
    deleteArticle,
    tokenAuthencitacion,
    getArticle,
    createSmallImage
}