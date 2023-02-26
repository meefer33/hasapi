import { Request, Response } from "express";
import { router } from "../utils";
import bcrypt from "bcryptjs";
import { gql } from "graphql-request";
import { client } from "../client";
import { generateJWT } from "../jwt";

router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body as Record<string, string>;
  console.log(password)
  const newPass = await bcrypt.hash(password,8)
  console.log(password)
  // In production app, you would check if user is already registered
  const { insert_users_one } = await client.request(
    gql`
      mutation ($email: String!, $password: String!) {
        insert_users_one(object: {email: $email, password: $password}) {
          id
        }
      }
    `,
    {
        email,
        password: newPass,
    }
  );

  const { id: userId } = insert_users_one;
console.log(insert_users_one,userId)
  const tokenContents = {
    sub: userId,
    iat: Date.now() / 1000,
    iss: 'https://api.apps33.dev',
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": userId,
      "x-hasura-default-role": "user",
      "x-hasura-role": "user"
    },
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }

  res.send({
    token: generateJWT({
      defaultRole: "user",
      allowedRoles: ["user"],
      otherClaims: {
        "X-Hasura-User-Id": userId,
      },
    }),
  });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as Record<string, string>;
console.log('email',email)
  let user = await client.request(
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
    }
  );

  // Since we filtered on a non-primary key we got an array back
  console.log('user',user[0])
  user = user[0];

  if (!user) {
    res.sendStatus(401);
    return;
  }

  // Check if password matches the hashed version
  const passwordMatch = await bcrypt.compare(password, user.password);
console.log('hello',passwordMatch)
  if (passwordMatch) {
    res.send({
      token: generateJWT({
        defaultRole: "user",
        allowedRoles: ["user"],
        otherClaims: {
          "X-Hasura-User-Id": user.id,
        },
      }),
    });
  } else {
    res.sendStatus(401);
  }
});

export default router;
