import { execute } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { ApolloServer } from "apollo-server";
import fetch from "node-fetch";

export const testServer = async (server: ApolloServer) => {
  const httpServer = await server.listen({
    port: 0,
  });

  const link = new HttpLink({
    uri: `http://localhost:${httpServer.port}`,
    fetch: fetch as any,
  });

  const executeOperation = ({ query, variables = {} }) =>
    execute(link, { query, variables });

  return {
    link,
    stop: () => httpServer.server.close(),
    graphql: executeOperation,
  };
};
