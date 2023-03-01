import * as jwt from "jsonwebtoken";

const HASURA_GRAPHQL_JWT_SECRET = {
  type: process.env.HASURA_JWT_SECRET_TYPE || "HS256",
  key:
    process.env.HASURA_JWT_SECRET_KEY ||
    "this-is-a-generic-HS256-secret-key-and-you-should-really-change-it",
};

interface GenerateJWTParams {
  defaultRole: string;
  allowedRoles: string[];
  userId: string[];
  otherClaims?: Record<string, string | string[]>;
  exp: string
}

export function generateJWT(params: GenerateJWTParams): string {
  const jwtConfig: jwt.SignOptions = {
    algorithm: HASURA_GRAPHQL_JWT_SECRET.type as "HS256",
    expiresIn: params.exp,
  };
  const payload = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": params.allowedRoles,
      "x-hasura-default-role": params.defaultRole,
      'x-hasura-user-id': params.userId,
      ...params.otherClaims,
    },
  };
  return jwt.sign(payload, HASURA_GRAPHQL_JWT_SECRET.key, jwtConfig);
}
