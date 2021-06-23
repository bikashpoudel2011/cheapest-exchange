import { config } from "../../../../config";
import { AbstractExchange } from "./AbstractExchange";
import {
  Exchange,
  IBestExecutionPriceParams,
  IExchangeInterface,
  IOrderBook,
} from "./IExchange";

export class Binance extends AbstractExchange implements IExchangeInterface {
  constructor() {
    super();
    this.baseURL = config.api.binance;
  }

  async getBestExecutionPrice({ btcAmount }: IBestExecutionPriceParams) {
    const orderBooks = await this.get<IOrderBook>(
      `api/v3/depth?symbol=BTCUSDT&limit=1000`
    );
    const { orderPrice: usdAmount } = this.orderBookToPriceReducer(
      orderBooks,
      btcAmount
    );
    return {
      btcAmount,
      usdAmount,
      exchange: Exchange.BINANCE,
    };
  }
}
