const { MongoClient } = require('mongodb')

var propList = []
var array = {}
var updated = false
var removed = false
var delivered = false
var sessionClosed = false

exports.main = async (func, database, collection, data, limit) => {
    const uri = 'mongodb://localhost:27017'
    // const uri = process.env.MONGO_URL
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
      return delivered
    }
    const removeDoc = async (database, collection, data) => {
      const result = await client
        .db(database)
        .collection(collection)
        .deleteOne(data)
      removed = true
      return removed
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
      return propList
    }
  
    const findOne = async (database, collection, data) => {
      const result = await client
        .db(database)
        .collection(collection)
        .findOne({ ...data })
      array = await [result]
      return array
    }
    const findMany = async (database, collection, data) => {
      const result = await client
        .db(database)
        .collection(collection)
        .find({ ...data })
        .sort({ createdAt: -1 })
      array = await result.toArray()
      return array
    }
    const limitFindMany = async (database, collection, data, limit) => {
      const result = await client
        .db(database)
        .collection(collection)
        .find({ ...data })
        .sort({ createdAt: -1 })
        .limit(limit)
      array = await result.toArray()
      return array
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
      return ({updated,sessionClosed})
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