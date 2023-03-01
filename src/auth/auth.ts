import { Request, Response } from 'express'
import { router } from '../utils'
import bcrypt from 'bcryptjs'
import { gql } from 'graphql-request'
import { client } from '../client'
import { generateJWT } from '../jwt'

router.post('/auth/register', async (req: Request, res: Response) => {
  const { email, password } = req.body as Record<string, string>

  const newPass = await bcrypt.hash(password, 8)

  const { insert_users_one } = await client.request(
    gql`
      mutation ($email: String!, $password: String!) {
        insert_users_one(object: { email: $email, password: $password }) {
          id
        }
      }
    `,
    {
      email,
      password: newPass,
    },
  )

  const { id: userId } = insert_users_one

  res.send({
    token: generateJWT({
      defaultRole: 'user',
      allowedRoles: ['user'],
      userId: userId,
      exp: '30d'
    }),
  })
})

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as Record<string, string>

  let { users } = await client.request(
    gql`
      query ($email: String!) {
        users(where: { email: { _eq: $email } }) {
          id
          password
        }
      }
    `,
    {
      email,
    },
  )

  // Since we filtered on a non-primary key we got an array back
  console.log('user', users)
  users = users[0]

  if (!users) {
    res.sendStatus(401)
    return
  }

  // Check if password matches the hashed version
  const passwordMatch = await bcrypt.compare(password, users.password)

  if (passwordMatch) {
    res.send({
      token: generateJWT({
        defaultRole: 'user',
        allowedRoles: ['user'],
        userId: users.id,
        exp: '30d'
      }),
    })
  } else {
    res.sendStatus(401)
  }
})

export default router
