const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session')

exports.InitializeApp = (app)=>{
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
      const corsOptions = {
        origin: ['https://xdot.vercel.app', 'http://localhost:3000'],
        optionsSuccessStatus: 200,
      }
      app.use(cors(corsOptions))
      app.use(bodyParser.json())
      // app.use((req, res, next) => {
      //   res.setHeader('Access-Control-Allow-Origin', '*')
      //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
      //   res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      //   res.setHeader('Access-Control-Allow-Credentials', true)
      //   next()
      // })
}