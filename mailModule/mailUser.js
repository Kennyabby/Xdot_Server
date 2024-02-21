const nodemailer = require('nodemailer')
const { sepList } = require('../algorithms/sepList')

const MAIL = process.env.MAIL
const MAIL_PASS = process.env.MAIL_PASS

exports.mailUser = (app)=>{
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
        var from = 'Pace Up <' + MAIL + '>'
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
}