import { IExchangeInterface } from "./IExchange";

export interface IDataSources {
  binance: IExchangeInterface;
  coinbase: IExchangeInterface;
  kraken: IExchangeInterface;
}
