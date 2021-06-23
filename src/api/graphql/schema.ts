import { gql } from "apollo-server";

const enums = gql`
  enum Exchange {
    BINANCE
    COINBASE
    KRAKEN
  }
`;

const inputs = gql`
  input ExchangeRoutingInput {
    "Amount of BTC to be aquired"
    btcAmount: String!
  }
`;

const types = gql`
  type ExchangeRouting {
    "Amount of BTC"
    btcAmount: String!
    "Amount of USD required to buy the specified BTC"
    usdAmount: String!
    "Best exchange to purchase from"
    exchange: Exchange
  }
`;

const queries = gql`
  type Query {
    exchangeRouting(
      exchangeRoutingParams: ExchangeRoutingInput!
    ): ExchangeRouting!
  }
`;

export const typeDefs = gql`
  scalar DateTime
  scalar Date
  scalar Time
  ${queries}
  ${types}
  ${inputs}
  ${enums}
`;
