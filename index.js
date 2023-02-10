const express = require('express')
require('https').globalAgent.options.rejectUnauthorized = false
const bodyParser = require('body-parser')
// require('dotenv').config({ path: __dirname + '/.env' })
const nodemailer = require('nodemailer')
const emailValidator = require('deep-email-validator')
const cors = require('cors')
const app = express()
const apiPort = process.env.PORT || 3001
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const { useEndecrypt } = require('./algorithms/useEndecrypt.js')
const { upload, getObject } = require('./imagesServices.js')
const ENCRYPTOR = process.env.ENCRYPTOR
const MAIL = process.env.MAIL
const MAIL_PASS = process.env.MAIL_PASS
var userProfile
var propList = []
var array = {}
var updated = false
var delivered = false
var sessionClosed = false

const sepList = ({ list, sep }) => {
  var newVar = ''
  list.forEach((item, i) => {
    if (list.length === 1) {
      newVar += item
    } else {
      if (i) {
        newVar += sep + ' ' + item
      } else {
        newVar += item
      }
    }
  })
  return newVar
}
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET',
  })
)
app.use(bodyParser.json({ limit: '60mb' }))
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  })
)
app.use(cors())
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(function (user, cb) {
  cb(null, user)
})
passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      // callbackURL: 'http://napsuiserver.herokuapp.com/auth/google/callback',
      callbackURL: 'http://localhost:3001/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile
      return done(null, userProfile)
    }
  )
)
app.get('/error', (req, res) => res.send('error logging in'))
app.post(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  async function (req, res) {
    // Successful authentication, redirect success.
    // res.redirect('/success')
    const user = userProfile
    const details = user._json
    console.log(details)
    // res.redirect(
    //   'http://localhost:3000/signin?name=' +
    //     details.name +
    //     '&sub=' +
    //     details.sub +
    //     '&email=' +
    //     details.email +
    //     '&email_verified=' +
    //     details.email_verified +
    //     '&locale=' +
    //     details.locale +
    //     '&picture=' +
    //     details.picture
    // )
    // await main(
    //   (func = 'createDoc'),
    //   (database = 'naps'),
    //   (collection = 'NapsDatabase'),
    //   (data = user)
    // )
    //   .catch(console.error)
    //   .then(async () => {
    //     console.log('delevered: ', delivered)
    //     res.json({
    //       isDelivered: delivered,
    //     })
    //   })
  }
)
app.post('/api/v1/auth/google', async (req, res) => {
  const { token } = req.body
  console.log('token:', token)
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  })
  const { name, email, picture } = ticket.getPayload()

  res.status(201)
  res.json({ user: { name, email, picture } })
})
app.post('/postUserDetails', async (req, res) => {
  const user = await req.body.studentInfo
  const password = user.password
  user.password = useEndecrypt('encrypt', ENCRYPTOR, password)
  user.sessionId = ObjectId()
  await main(
    (func = 'createDoc'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = user)
  )
    .catch(console.error)
    .then(async () => {
      const base64Image = req.body.imageInfo.image
      const imageName = req.body.imageInfo.imageName
      const type = req.body.imageInfo.imageType
      var response
      try {
        response = await upload(
          imageName,
          base64Image,
          type,
          user.matricNo,
          'profileImages'
        )
      } catch (err) {
        console.error(`Error uploading image: ${err.message}`)
        return next(new Error(`Error uploading image: ${imageName}`))
      }
      res.json({
        isDelivered: delivered,
      })
    })
})
app.post('/updateUserImg', async (req, res) => {
  await main(
    (func = 'updateOne'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = req.body.prop)
  )
    .catch(console.error)
    .then(async () => {
      const base64Image = req.body.imageInfo.image
      const imageName = req.body.imageInfo.imageName
      const type = req.body.imageInfo.imageType
      var response
      try {
        response = await upload(
          imageName,
          base64Image,
          type,
          req.body.prop[0].matricNo,
          'profileImages'
        )
      } catch (err) {
        console.error(`Error uploading image: ${err.message}`)
        return next(new Error(`Error uploading image: ${imageName}`))
      }
      res.json({
        isDelivered: updated,
      })
    })
})
app.post('/getImgUrl', async (req, res) => {
  url = await getObject(
    req.body.imgUrl,
    req.body.matricNo,
    req.body.imagePath !== undefined ? req.body.imagePath : 'profileImages'
  )
  res.json({
    url: url,
  })
})
app.post('/get_google_id', async (req, res) => {
  res.json({
    google_id: GOOGLE_CLIENT_ID,
  })
})
app.post('/postQuiz', async (req, res) => {
  await main(
    (func = 'createDoc'),
    (database = 'naps'),
    (collection = req.body.collection),
    (data = req.body.update)
  )
    .catch(console.error)
    .then(async () => {
      req.body.imagesInfo.forEach(async (imageInfo, i) => {
        const base64Image = imageInfo.image
        const imageName = imageInfo.imageName
        const type = imageInfo.imageType
        var response
        try {
          response = await upload(
            imageName,
            base64Image,
            type,
            req.body.update.matricNo,
            'postImages'
          )
        } catch (err) {
          console.error(`Error uploading image: ${err.message}`)
          return next(new Error(`Error uploading image: ${imageName}`))
        }
      })
      res.json({
        isDelivered: delivered,
      })
    })
})

app.post('/isMatricPresent', async (req, res) => {
  await main(
    (func = 'findOne'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = req.body)
  )
    .catch(console.error)
    .then(() => {
      if (array[0] === null) {
        res.json({
          isPresent: false,
        })
      } else {
        res.json({
          isPresent: true,
        })
      }
    })
})
app.post('/isEmailPresent', async (req, res) => {
  await main(
    (func = 'findOne'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = req.body)
  )
    .catch(console.error)
    .then(() => {
      if (array[0] === null) {
        res.json({
          isPresent: false,
        })
      } else {
        res.json({
          isPresent: true,
          id: array[0].sessionId,
        })
      }
    })
})

app.post('/getUserDetails', async (req, res) => {
  await main(
    (func = 'findOne'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data =
      req.body.matricNo !== undefined
        ? req.body
        : { sessionId: ObjectId(req.body.sessionId) })
  )
    .catch(console.error)
    .then(() => {
      res.json({
        user: array[0],
      })
    })
})
app.post('/getUsersDetails', async (req, res) => {
  await main(
    (func = 'findMany'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = req.body)
  )
    .catch(console.error)
    .then(() => {
      res.json({
        users: array,
      })
    })
})
app.post('/getUpdates', async (req, res) => {
  await main(
    (func = 'limitFindMany'),
    (database = 'naps'),
    (collection = req.body.collection),
    (data = req.body.data),
    (limit = req.body.limit)
  )
    .catch(console.error)
    .then(() => {
      res.json({
        updates: array,
      })
    })
})
app.post('/getOneUpdate', async (req, res) => {
  await main(
    (func = 'findOne'),
    (database = 'naps'),
    (collection = req.body.collection),
    (data = req.body.data)
  )
    .catch(console.error)
    .then(() => {
      res.json({
        update: array[0],
      })
    })
})
app.post('/updateOneUser', async (req, res) => {
  await main(
    (func = 'updateOne'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = req.body.prop)
  )
    .catch(console.error)
    .then(() => {
      res.json({
        updated: updated,
      })
    })
})
app.post('/updateOneDoc', async (req, res) => {
  await main(
    (func = 'updateOne'),
    (database = 'naps'),
    (collection = req.body.collection),
    (data = req.body.prop)
  )
    .catch(console.error)
    .then(() => {
      res.json({
        updated: updated,
      })
    })
})
app.post('/closeSession', async (req, res) => {
  const newUserId = ObjectId()
  await main(
    (func = 'updateOne'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = [{ _id: ObjectId(req.body.prop[0]._id) }, { sessionId: newUserId }])
  )
    .catch(console.error)
    .then(() => {
      res.json({
        sessionClosed: sessionClosed,
      })
    })
})
app.post('/getpassList', async (req, res) => {
  await main(
    (func = 'findOne'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = req.body.prop)
  )
    .catch(console.error)
    .then(() => {
      if (array[0] !== undefined && array[0] !== null) {
        var password = useEndecrypt('decrypt', ENCRYPTOR, array[0].password)
        if (password.trim() === req.body.pass.trim()) {
          res.json({
            id: array[0].sessionId,
            confirmed: true,
          })
        } else {
          res.json({
            id: '',
            confirmed: false,
          })
        }
      } else {
        res.json({
          id: '',
          confirmed: false,
        })
      }
    })
})

app.post('/getNapsSettings', async (req, res) => {
  await main(
    (func = 'findDocprop'),
    (database = 'naps'),
    (collection = 'NapsSettings'),
    (data = req.body)
  )
    .catch(console.error)
    .then(() => {
      res.json({
        settings: propList,
      })
    })
})
app.post('/updateNapsSettings', async (req, res) => {
  await main(
    (func = 'updateOne'),
    (database = 'naps'),
    (collection = 'NapsSettings'),
    (data = req.body.prop)
  )
    .catch(console.error)
    .then(() => {
      res.json({
        updated: updated,
      })
    })
})
app.post('/validateMail', async (req, res) => {
  emailValidator.validate(req.body.email).then((response) => {
    if (response.valid === true) {
      res.json({
        isValid: true,
      })
    } else if (response.valid === false) {
      res.json({
        isValid: false,
      })
    }
  })
  // console.log(valid)
})
app.post('/mailUser', async (req, res) => {
  // console.log('preparing mail...')
  details = req.body
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MAIL,
      pass: MAIL_PASS,
    },
  })
  var from = 'Encart oo <' + MAIL + '>'
  var mailOptions = {
    from: from,
    to: sepList({ list: details.to, sep: ',' }),
    subject: details.subject,
  }
  if (details.type === 'html') {
    mailOptions.html = details.message
  } else {
    mailOptions.text = details.message
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json({
        mailDelivered: false,
      })
    } else {
      res.json({
        mailDelivered: true,
        info: info.response,
      })
    }
  })
})
app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))
const positionSettings = {
  positionSettings: [
    {
      position: 'president',
      description: 'First member and the head of the association',
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['300'], cgpa: '2.50' },
    },
    {
      position: 'vice president',
      description:
        'Assistant and advisor to the president in the performance of his duties',
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['100', '200', '300'], cgpa: '2.00' },
    },
    {
      position: 'general secretary',
      description:
        'Responsible for all the secretarial duties of the association',
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['100', '200', '300'], cgpa: '2.00' },
    },
    {
      position: 'assistant general secretary',
      description:
        'Assistant and advisor to the general secretary in the performance of his duties',
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['100', '200', '300'], cgpa: '2.00' },
    },
    {
      position: 'public relation officer',
      description:
        "Responsible for the publicity of the association's activities",
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['100', '200', '300'], cgpa: '2.00' },
    },
    {
      position: 'finacial secretary',
      description:
        "Responsible for recieving and accounting for all the associations's money derived from any source",
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['300'], cgpa: '2.00' },
    },
    {
      position: 'social director',
      description:
        'Responsible for the promotion and organization of social and recreational activities of the association',
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['100', '200', '300'], cgpa: '2.00' },
    },
    {
      position: 'sport director',
      description: 'Coordinator of all sporting activities of the association',
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['100', '200', '300'], cgpa: '2.00' },
    },
    {
      position: 'academic coordinator',
      description: 'Chairman of the academic committee of the assocition',
      heldBy: 'vacant',
      previouslyHeldBy: [],
      requirements: { level: ['100', '200', '300'], cgpa: '2.00' },
    },
  ],
}
const main = async (func, database, collection, data, limit) => {
  // note:
  // const uri = 'mongodb://localhost:27017'
  const uri = process.env.MONGO_URL
  const client = new MongoClient(uri, { useNewUrlParser: true })
  const listDatabases = async () => {
    const databaseList = await client.db().admin().listDatabases()
    databaseList.databases.forEach((db) => console.log(` - ${db.name}`))
  }
  const createDoc = async (database, collection, data) => {
    delivered = false
    const result = await client
      .db(database)
      .collection(collection)
      .insertOne(data)
    delivered = true
  }
  const removeDoc = async (database, collection, data) => {
    const result = await client
      .db(database)
      .collection(collection)
      .deleteOne(data)
  }
  const findDocprop = async (database, collection, data) => {
    const result = await client
      .db(database)
      .collection(collection)
      .find({}, { projection: { ...data } })
    var prop = await result.toArray()
    propList = []
    for (var i = 0; i < prop.length; i++) {
      propList = propList.concat(prop[i])
    }
  }

  const findOne = async (database, collection, data) => {
    const result = await client
      .db(database)
      .collection(collection)
      .findOne({ ...data })
    array = await [result]
    // return false
  }
  const findMany = async (database, collection, data) => {
    const result = await client
      .db(database)
      .collection(collection)
      .find({ ...data })
      .sort({ createdAt: -1 })
    array = await result.toArray()
  }
  const limitFindMany = async (database, collection, data, limit) => {
    const result = await client
      .db(database)
      .collection(collection)
      .find({ ...data })
      .sort({ createdAt: -1 })
      .limit(limit)
    array = await result.toArray()
  }
  const updateOne = async (database, collection, data) => {
    sessionClosed = false
    updated = false
    const result = await client
      .db(database)
      .collection(collection)
      .updateOne(data[0], { $set: data[1] })
    updated = true
    sessionClosed = true
  }
  try {
    await client.connect()
    if (func === 'listDatabases') {
      await listDatabases(client)
    }
    if (func === 'createDoc') {
      await createDoc(database, collection, data)
    }
    if (func === 'removeDoc') {
      await removeDoc(database, collection, data)
    }
    if (func === 'findDocprop') {
      await findDocprop(database, collection, data)
    }
    if (func === 'findOne') {
      await findOne(database, collection, data)
    }
    if (func === 'findMany') {
      await findMany(database, collection, data)
    }
    if (func === 'limitFindMany') {
      await limitFindMany(database, collection, data, limit)
    }
    if (func === 'updateOne') {
      await updateOne(database, collection, data)
    }
  } catch (e) {
    console.error(e)
    // return true
  } finally {
    await client.close()
  }
}
// main('createDoc', 'naps', 'NapsSettings', positionSettings)
