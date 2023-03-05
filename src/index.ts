import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
const app = express()

const port = process.env.PORT || 3000
app.use(express.json())
app.get('/', (req, res) => res.send('Hello World!'))
app.post('/:type/:route', (req, res) => {
  try {
    const handler = require(`./handlers/${req.params.type}/${req.params.route}`)
    if (!handler) {
      res.status(404).json({
        message: 'not found',
        extensions: {
          code: 404,
        },
      })
    }
    handler(req, res)
  } catch (e) {
    console.error(e)
    res.status(400).json({
      message: 'unexpected error occured',
      extensions: {
        code: 400,
      },
    })
  }
})

app.all('*', function (req, res) {
  res.status(404).send({
    message: 'not found',
    extensions: {
      code: 404,
    },
  })
})

app.listen(port, () => {
  console.log(`Auth server running on port ${port}.`)
})
