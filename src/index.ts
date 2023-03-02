import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
const app = express()
import auth from './auth/auth'

const port = process.env.PORT || 3000
app.use(express.json())

app.post('/:route', (req, res) => {
  try {
    const handler = require(`./handlers/${req.params.route}`)
    if (!handler) {
      return res.status(404).json({
        message: `not found`,
      })
    }
    return handler(req, res)
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: `unexpected error occured`,
    })
  }
})

/*
app.get('/auth', (request, response) => {
  console.log('hit')
  const token = request.get('Authorization')
  console.log('token', token)
  if (token) {
    response.json({
      'X-Hasura-User-Id': '25',
      'X-Hasura-Role': 'user',
    })
  } else {
    response.json({
      'X-Hasura-Role': 'public',
    })
  }
})

app.use(auth)
*/

app.listen(port, () => {
  console.log(`Auth server running on port ${port}.`)
})
