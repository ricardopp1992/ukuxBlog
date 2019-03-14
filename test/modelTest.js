'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const sendEmail = require('../models/nodemailer/index')

describe('testing models', () => {
    beforeEach(function () {
        const connectionStub = sinon.sandbox.create()

        
    })

    it('testing select user', () => {
        sendEmail('rikrdo1992@gmail.com', 'Mensajeeee loco', 'Eesto es un msj')
    })
})

