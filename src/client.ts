import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient(process.env.GRAPHQL_CLIENT as string, {
  headers: { "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET as string },
});
