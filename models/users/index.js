'use strict'

const uuid = require('uuid/v4')
const fs = require('fs')
const path = require('path')


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

// recordar agregar la imagen luego
function insertArticle(connection, article){
    return new Promise( async (resolve, reject) => {
        const { token, title, date, content, categoryArticle} = article
        let image

        try {
            const isAuthenticated = await tokenAuthencitacion(connection, token)
            const author = isAuthenticated.author

            if (isAuthenticated.resp) {
                try{
                    fs.readFile(path.join(__dirname, '../../imageTemp/image.jpg'), function (err, data) {
                        console.log(data)
                        
                        const insertArticle = 'INSERT INTO articulo (titulo, contenido, fecha, autor, imagen, categoria ) VALUES (?, ?, ?, ?, ?, ?)'

                        connection.query(insertArticle, [title, content, date, author, data, categoryArticle], (err, results, fields) => {
                            if(Boolean(err)){
                                reject({ resp: false, message: err.message})

                            } else if(results.affectedRows){
                                resolve({ resp: true, message: 'article inserted successful' })

                            } else {
                                reject({ resp: false, message: 'the article insertion has failed' })

                            }
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

function getArticles(connection, author = false){
    return new Promise((resolve, reject) => {
        const authorEsc = (author) ? `%${author}` : '%'
        const selectArticles = 'SELECT * FROM articulo WHERE autor LIKE ? ORDER BY fecha DESC'

        connection.query(selectArticles, [authorEsc], (err, rows, fields) => {
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
                        reject({resp: false, message: err.message})
    
                    }else if(result.affectedRows == 1){
                        resolve({ resp: true, message: 'delete successful' })
    
                    }else {
                        reject({resp: false, message: 'something happen'})
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

module.exports = {
    getUser,
    insertArticle,
    getArticles,
    deleteArticle,
    tokenAuthencitacion,
    getArticle
}