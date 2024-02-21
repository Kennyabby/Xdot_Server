const emailExistence = require('email-existence')

exports.validateMail = (app)=> {
    app.post('/validateMail', async (req, res) => {
        console.log('validating...', req.body.email)
        await emailExistence.check(req.body.email, (error, response) => {
          if (error) {
            res.json({
              isValid: false,
            })
          } else {
            console.log('validation response for', req.body.email, ': ', response)
            if (response === true) {
              console.log('it is true')
              res.json({
                isValid: true,
              })
            } else {
              console.log('it is false')
              res.json({
                isValid: false,
              })
            }
          }
        })
      })
}