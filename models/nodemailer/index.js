// al parecer el error es porque el server no está cifrado
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
'use strict'

const { clientId, clientSecret, refreshToken } = require('../../conf')

const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

function sendEmail (email, message, subject){
    new Promise(async (res, rej) => {
        const oauth2Client = new OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground')
        oauth2Client.setCredentials({ refresh_token: refreshToken })
    
        const tokens = await oauth2Client.getAccessToken()

        const accessToken = tokens.token
    
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
                    type: "OAuth2",
                    user: "ricardopp1992@gmail.com", 
                    clientId: clientId,
                    clientSecret: clientSecret,
                    refreshToken: refreshToken,
                    accessToken: accessToken
                },
            tls: {
                rejectUnauthorized: false
            }
        })
        
        const mailOptions = {
            from: 'ricardopp1992@gmail.com', // sender address
            to: email, // list of receivers
            subject,  // Subject line
            html: `<p>${ message }</p>`// plain text body
          };
    
        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              rej(err)
            else
              res(info);
         });
    })

}

module.exports = sendEmail
