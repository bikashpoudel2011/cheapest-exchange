import BigNumber from "bignumber.js";

export enum Exchange {
  BINANCE = "BINANCE",
  COINBASE = "COINBASE",
  KRAKEN = "KRAKEN",
}

export interface IBestExecutionPriceParams {
  btcAmount: BigNumber;
}

export interface IBestExecutionPrice {
  btcAmount: BigNumber;
  usdAmount: BigNumber;
  exchange: Exchange;
}

export interface IOrderBook {
  bids: [[string, string]];
  asks: [[string, string]];
}

export interface IExchangeInterface {
  getBestExecutionPrice(
    params: IBestExecutionPriceParams
  ): Promise<IBestExecutionPrice>;
}
