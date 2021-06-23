import { ApolloServer } from "apollo-server";
import { resolvers, typeDefs } from "./graphql";
import { Binance, Coinbase } from "./graphql/dataSources";
import { Kraken } from "./graphql/dataSources/Kraken";
import { logger } from "./logger";

const port = Number(process.env.API_PORT) || 8080;

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    coinbase: new Coinbase(),
    binance: new Binance(),
    kraken: new Kraken(),
  }),
});

server
  .listen({
    port,
  })
  .then(() => {
    logger.info(`ApolloServer running on ${port}`);
  });
