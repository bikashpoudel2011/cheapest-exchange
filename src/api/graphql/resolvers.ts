import BigNumber from "bignumber.js";
import { IBestExecutionPrice, IDataSources } from "../graphql/dataSources";
import { logger } from "../logger";

interface IExchangeRoutingParams {
  exchangeRoutingParams: {
    btcAmount: string;
  };
}

export interface IContext {
  dataSources: IDataSources;
}

function errorLogger(e) {
  logger.error(e);
  return undefined;
}

export const resolvers = {
  Query: {
    exchangeRouting: async (
      _,
      params: IExchangeRoutingParams,
      context: IContext
    ): Promise<IBestExecutionPrice> => {
      const bestExecutionPrices = await Promise.all(
        Object.keys(context.dataSources).map((dataSource) =>
          context.dataSources[dataSource]
            .getBestExecutionPrice({
              btcAmount: new BigNumber(params.exchangeRoutingParams.btcAmount),
            })
            .catch(errorLogger)
        )
      );

      const allBestExecutionPrices = bestExecutionPrices.filter(
        (bestExecutionPrice): bestExecutionPrice is IBestExecutionPrice =>
          bestExecutionPrice !== undefined
      );

      if (allBestExecutionPrices.length === 0) {
        throw new Error(
          `Cannot find best execution price for ${params.exchangeRoutingParams.btcAmount} bitcoin`
        );
      }

      return allBestExecutionPrices.reduce((p, c) =>
        p.usdAmount.isLessThan(c.usdAmount) ? p : c
      );
    },
  },
};
