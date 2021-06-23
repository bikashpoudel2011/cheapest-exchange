import BigNumber from "bignumber.js";
import { config } from "../../../../config";
import { AbstractExchange } from "./AbstractExchange";
import { NotEnoughUnits } from "./error";
import {
  Exchange,
  IBestExecutionPriceParams,
  IExchangeInterface,
  IOrderBook,
} from "./IExchange";

export class Coinbase extends AbstractExchange implements IExchangeInterface {
  constructor() {
    super();
    this.baseURL = config.api.coinbase;
  }

  private async getOrderBook(level: number, btcAmount: BigNumber) {
    const orderBooks = await this.get<IOrderBook>(
      `products/BTC-USD/book?level=${level}`
    );
    return this.orderBookToPriceReducer(orderBooks, btcAmount);
  }

  public async getBestExecutionPrice({ btcAmount }: IBestExecutionPriceParams) {
    let usdAmount: BigNumber;

    /**
     * If level 2 api cannot fulfill units requested, using level 3 api
     */
    try {
      ({ orderPrice: usdAmount } = await this.getOrderBook(2, btcAmount));
    } catch (e) {
      if (e instanceof NotEnoughUnits) {
        ({ orderPrice: usdAmount } = await this.getOrderBook(3, btcAmount));
      } else {
        throw e;
      }
    }

    return {
      btcAmount,
      usdAmount,
      exchange: Exchange.COINBASE,
    };
  }
}
