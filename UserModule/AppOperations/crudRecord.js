
exports.crudRecord = (app, main, upload)=>{

    app.post('/createPost', async (req, res) => {
        await main(
            (func = 'createDoc'),
            (database = req.body.database),
            (collection = req.body.collection),
            (data = req.body.update)
        )
        .catch(console.error)
        .then(async (result) => {
        if (req.body.imagesInfo !== undefined) {
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
                req.body.update.userName,
                'postImages'
                )
            } catch (err) {
                console.error(`Error uploading image: ${err.message}`)
                return next(new Error(`Error uploading image: ${imageName}`))
            }
            })
        }
        res.json({
            isDelivered: result,
        })
        })
    })

    app.post('/getUpdates', async (req, res) => {
        const tags = req.body.tags
        await main(
            (func = 'limitFindMany'),
            (database = req.body.database),
            (collection = req.body.collection),
            (data = { ...req.body.data, tags: { $in: tags } }),
            (limit = req.body.limit)
        )
        .catch(console.error)
        .then((array) => {
        res.json({
            updates: array,
        })
        })
    })
    app.post('/getOneUpdate', async (req, res) => {
        await main(
            (func = 'findOne'),
            (database = req.body.database),
            (collection = req.body.collection),
            (data = req.body.data)
        )
        .catch(console.error)
        .then((array) => {
        res.json({
            update: array[0],
        })
        })
    })
    app.post('/getManyUpdates', async (req, res) => {
        await main(
            (func = 'findMany'),
            (database = req.body.database),
            (collection = req.body.collection),
            (data = req.body.data)
        )
        .catch(console.error)
        .then((array) => {
        res.json({
            updates: array,
        })
        })
    })

}