import { FetchResult, Observable, toPromise } from "apollo-link";
import { gql } from "apollo-server";
import { server } from "../../api";
import { IBestExecutionPrice } from "../../api/graphql/dataSources";
import { testServer as testServerBuilder } from "./testServer";

const EXCHANGE_ROUTING_QUERY = gql`
  query exchangeRouting($btcAmount: String!) {
    exchangeRouting(exchangeRoutingParams: { btcAmount: $btcAmount }) {
      btcAmount
      usdAmount
      exchange
    }
  }
`;

describe("server - e2e", () => {
  let stop;
  let graphql;

  beforeEach(async () => {
    const testServer = await testServerBuilder(server);
    stop = testServer.stop;
    graphql = testServer.graphql;
  });

  afterEach(async () => {
    await stop();
  });

  it("should return best exchange to buy the desired amount of bitcoin", async () => {
    const {
      data: { exchangeRouting },
    } = await toPromise<{
      data: { exchangeRouting: IBestExecutionPrice };
      error;
    }>(
      graphql({
        query: EXCHANGE_ROUTING_QUERY,
        variables: { btcAmount: "1" },
      })
    );

    expect(exchangeRouting).toMatchObject({
      btcAmount: "1",
      usdAmount: expect.any(String),
      exchange: expect.any(String),
    });
  });

  it("should return error when none of the exchange has got stock for the quantity requested", async () => {
    const { errors } = await toPromise<{ errors }>(
      graphql({
        query: EXCHANGE_ROUTING_QUERY,
        variables: { btcAmount: "1000000000000000" },
      })
    );

    expect(errors[0].message).toBe(
      `Cannot find best execution price for 1000000000000000 bitcoin`
    );
  });
});
