import { config } from "../../../../config";
import { AbstractExchange } from "./AbstractExchange";
import {
  Exchange,
  IBestExecutionPriceParams,
  IExchangeInterface,
  IOrderBook,
} from "./IExchange";

interface IKrakenOrderBook {
  error: string[];
  result: {
    // Kraken returns order book using the pair
    [key: string]: IOrderBook;
  };
}

export class Kraken extends AbstractExchange implements IExchangeInterface {
  constructor() {
    super();
    this.baseURL = config.api.kraken;
  }

  async getBestExecutionPrice({ btcAmount }: IBestExecutionPriceParams) {
    const orderBooks = await this.get<IKrakenOrderBook>(
      `0/public/Depth?pair=TBTCUSD`
    );
    const { orderPrice: usdAmount } = this.orderBookToPriceReducer(
      Object.values(orderBooks.result)[0],
      btcAmount
    );
    return {
      btcAmount,
      usdAmount,
      exchange: Exchange.KRAKEN,
    };
  }
}
