
exports.imgpostget = (app, main, upload, getObject)=>{
    app.post('/updateUserImg', async (req, res) => {
        await main(
        (func = 'updateOne'),
        (database = 'users'),
        (collection = 'UsersDatabase'),
        (data = req.body.prop)
        )
        .catch(console.error)
        .then(async (result) => {
            const base64Image = req.body.imageInfo.image
            const imageName = req.body.imageInfo.imageName
            const type = req.body.imageInfo.imageType
            var response
            try {
            response = await upload(
                imageName,
                base64Image,
                type,
                req.body.prop[0].userName,
                'profileImages'
            )
            } catch (err) {
            console.error(`Error uploading image: ${err.message}`)
            return next(new Error(`Error uploading image: ${imageName}`))
            }
            res.json({
            isDelivered: result,
            })
        })
    })
    app.post('/getImgUrl', async (req, res) => {
        url = await getObject(
        req.body.imgUrl,
        req.body.userName,
        req.body.imagePath !== undefined ? req.body.imagePath : 'profileImages'
        )
        res.json({
        url: url,
        })
    })
}