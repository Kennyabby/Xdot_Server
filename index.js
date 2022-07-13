const express = require('express')
const bodyParser = require('body-parser')
// require('dotenv').config({path: __dirname + '/.env'})
const cors = require('cors')
const app = express()
const apiPort = process.env.PORT || 3001
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const { useEndecrypt } = require('./algorithms/useEndecrypt.js')
const {upload} = require('./imagesServices.js')
var propList = []
var array = {}
var updated = false
var delivered = false
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())
app.use((req, res, next)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.post('/postUserDetails', async (req, res) => {
  const user = await req.body.info
  const password = user.password
  const identificationKey = user.identificationKey
  user.password = useEndecrypt('encrypt', identificationKey, password)
  user.identificationKey = useEndecrypt('encrypt', '4554', identificationKey)
  await main(
    (func = 'createDoc'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = user)
  ).catch(console.error)
  .then(async()=>{
    const base64Image = req.body.imageInfo.image
    const imageName = req.body.imageInfo.imageName
    const type = req.body.imageInfo.imageType
    var response;
    try{
      response = await upload(imageName, base64Image,type)
    }catch(err){
      console.error(`Error uploading image: ${err.message}`)
      return next(new Error(`Error uploading image: ${imageName}`))
    }
    res.json({
      isDelivered: delivered,
    })
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
    .then(() => {
      res.json({
        isDelivered: delivered,
      })
    })
})

app.post('/getMatricList', async (req, res) => {
  await main(
    (func = 'findDocprop'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = req.body)
  )
    .catch(console.error)
    .then(() => {
      var list = propList.map((obj) => {
        return obj.matricNo
      })
      res.json({
        matricList: list,
      })
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
        : { _id: ObjectId(req.body._id) })
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
    (data = req.body.prop)
  )
    .catch(console.error)
    .then(() => {
      console.log(array[0])
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
app.post('/getpassList', async (req, res) => {
  await main(
    (func = 'findOne'),
    (database = 'naps'),
    (collection = 'NapsDatabase'),
    (data = req.body)
  )
    .catch(console.error)
    .then(() => {
      if (array[0] !== undefined && array[0] !== null) {
        var key = useEndecrypt('decrypt', '4554', array[0].identificationKey)
        var password = useEndecrypt('decrypt', key, array[0].password)

        res.json({
          id: array[0]._id,
          password: password,
        })
      } else {
        res.json({
          id: '',
          password: '',
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
        settings: propList[0],
      })
    })
})
app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))

const main = async (func, database, collection, data, limit) => {
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
    updated = false
    const result = await client
      .db(database)
      .collection(collection)
      .updateOne(data[0], { $set: data[1] })
    updated = true
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
  } finally {
    await client.close()
  }
}
