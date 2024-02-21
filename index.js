const express = require('express')
require('https').globalAgent.options.rejectUnauthorized = false

require('dotenv').config({ path: __dirname + '/.env' })

const app = express()
const apiPort = process.env.PORT || 3001

const { useEndecrypt } = require('./algorithms/useEndecrypt.js')
const { upload, getObject } = require('./fileModule/imagesServices.js')
const { main } = require('./DatabaseModules/main.js')
const { validateMail } = require('./mailModule/validateMail.js')
const { mailUser } = require('./mailModule/mailUser.js')
const { userLogin } = require('./UserModule/userLogin.js')
const { InitializeApp } = require('./InitializingModule/InitializeApp.js')
const { imgpostget } = require('./UserModule/imgpostget.js')
const { userRecordUpdate } = require('./UserModule/userRecordUpdate.js')
const { crudRecord } = require('./UserModule/AppOperations/crudRecord.js')


InitializeApp(app)
userLogin(app, main, useEndecrypt)
imgpostget(app, main, upload, getObject)
userRecordUpdate(app, main)
crudRecord(app, main, upload)



app.post('/getSettings', async (req, res) => {
  await main(
    (func = 'findDocprop'),
    (database = req.body.datbase),
    (collection = req.body.collection),
    (data = req.body)
  )
    .catch(console.error)
    .then((propList) => {
      res.json({
        settings: propList,
      })
    })
})
app.post('/updateSettings', async (req, res) => {
  await main(
    (func = 'updateOne'),
    (database = req.body.database),
    (collection = req.body.collection),
    (data = req.body.prop)
  )
    .catch(console.error)
    .then((result) => {
      res.json({
        updated: result.updated,
      })
    })
})
validateMail(app)
mailUser(app)
app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))
