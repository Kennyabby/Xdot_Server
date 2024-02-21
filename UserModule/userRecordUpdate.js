
exports.userRecordUpdate = (app, main)=>{
    app.post('/createDoc', async (req, res) => {
        await main(
            (func = 'createDoc'),
            (database = req.body.database),
            (collection = req.body.collection),
            (data = req.body.update)
        )
        .catch(console.error)
        .then(async (delivered) => {
            res.json({
                isDelivered: delivered,
            })
        })
    })

    app.post('/isDocPresent', async (req, res) => {
        await main(
            (func = 'findOne'),
            (database = req.body.database),
            (collection = req.body.collection),
            (data = req.body.data)
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
    
    app.post('/updateOneDoc', async (req, res) => {
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
    
    app.post('/removeDoc', async (req, res) => {
        await main(
            (func = 'removeDoc'),
            (database = req.body.database),
            (collection = req.body.collection),
            (data = req.body.update)
        )
        .catch(console.error)
        .then(async (removed) => {
            res.json({
                isRemoved: removed,
            })
        })
    })
}