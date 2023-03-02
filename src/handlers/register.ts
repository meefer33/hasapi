import bcrypt from 'bcryptjs';
import { Request, Response } from 'express'
import { generateJWT } from '../jwt';

const HASURA_OPERATION = `
mutation ($email: String!, $password: String!) {
  insert_users_one(object: {
    email: $email,
    password: $password
  }) {
    id
  }
}
`;

// execute the parent mutation in Hasura
const execute = async (variables:any, reqHeaders:any) => {
  const fetchResponse = await fetch(
    "http://hasapi.apps33.dev/v1/graphql",
    {
      method: 'POST',
      headers: reqHeaders || {},
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  return await fetchResponse.json();
};
  

// Request Handler
const handler = async (req:Request, res:Response) => {

  // get request input
  const { email, password } = req.body.input;

  // run some business logic
  let hashedPassword = await bcrypt.hash(password, 10);
console.log(req.headers)
  // execute the Hasura operation
  const { data, errors } = await execute({ email, password: hashedPassword }, req.headers);

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json({
        "message": "got an error",
        "extensions": errors
      })
  }

  const token = generateJWT({
    defaultRole: 'user',
    allowedRoles: ['user'],
    userId: data.insert_users_one.id.toString(),
    exp: '30d'
  })

  // success
  return res.json({
    userId: data.insert_users_one.id.toString(),
    token: token
  })

}

module.exports = handler;