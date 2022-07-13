const AWS = require('aws-sdk')
const BUCKET_NAME = process.env.BUCKET_NAME
const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
})

/**
 * @description Uploads an image to S3
 * @param imageName Image name
 * @param base64Image Image body converted to base 64
 * @param type Image type
 * @return string S3 image URL or error accordingly
 */
const upload = async (imageName, base64Image, type)=>{
    const params = {
        Bucket: `${BUCKET_NAME}/images`,
        Key: imageName,
        Body: new Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64'),
        ContentType: type,
        Expires: 60
    };

    let data;

    try {
        data = await promiseUpload(params);
    } catch (err) {
        console.error(err);
        return "";
    }

    return data.Location;
}
/**
 * @description Promise an upload to S3
 * @param params S3 bucket params
 * @return data/err S3 response object
 */
const promiseUpload = (params) =>{
    return new Promise ((resolve, reject)=> {
        s3.upload(params, (err, data)=> {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

module.exports = {upload};