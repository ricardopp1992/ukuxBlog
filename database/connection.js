'use strict'

const mysql = require('mysql')
const conf = require('../conf')

const pool = mysql.createPool({
    connectionLimit: 15,
    host: conf.host,
    user: conf.user,
    password: conf.password,
    database: conf.database
})
    
pool.getConnection( (err, connection) => {
    if(err){
        console.log(err)
        
    } else {
        connection.query('SELECT 1 + 1 as solution',  (err, rows, fields) => {
            if(err) {
                console.error(err)
            }
    
            console.log(`Database connected: ${ rows[0].solution }`)
    
        })    

    }
})

module.exports = pool