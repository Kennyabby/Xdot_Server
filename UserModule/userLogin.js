const ObjectId = require('mongodb').ObjectId
const ENCRYPTOR = process.env.ENCRYPTOR

exports.userLogin = (app, main, useEndecrypt)=>{
    app.post('/isUserPresent', async (req, res) => {
        await main(
            (func = 'findOne'),
            (database = 'users'),
            (collection = 'UsersDatabase'),
            (data = req.body)
        )
        .catch(console.error)
        .then((array) => {
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

    app.post('/getpassList', async (req, res) => {
        await main(
            (func = 'findOne'),
            (database = 'users'),
            (collection = 'UsersDatabase'),
            (data = req.body.prop)
        )
        .catch(console.error)
        .then((array) => {
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

    app.post('/postUserDetails', async (req, res) => {
        const user = await req.body.studentInfo
        const password = user.password
        user.password = useEndecrypt('encrypt', ENCRYPTOR, password)
        user.sessionId = ObjectId()
        await main(
            (func = 'createDoc'),
            (database = 'users'),
            (collection = 'UsersDatabase'),
            (data = user)
        )
        .catch(console.error)
        .then(async (result) => {
            res.json({
                isDelivered: result,
            })
        })
    })

    app.post('/closeSession', async (req, res) => {
        const newUserId = ObjectId()
        await main(
            (func = 'updateOne'),
            (database = 'users'),
            (collection = 'UsersDatabase'),
            (data = [{ _id: ObjectId(req.body.prop[0]._id) }, { sessionId: newUserId }])
        )
        .catch(console.error)
        .then((result) => {
            res.json({
                sessionClosed: result.sessionClosed,
            })
        })
    })
}