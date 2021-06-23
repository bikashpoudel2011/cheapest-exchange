import { RESTDataSource } from "apollo-datasource-rest";
import BigNumber from "bignumber.js";
import { NotEnoughUnits } from "./error";
import {
  IBestExecutionPrice,
  IBestExecutionPriceParams,
  IExchangeInterface,
  IOrderBook,
} from "./IExchange";

export abstract class AbstractExchange
  extends RESTDataSource
  implements IExchangeInterface {
  abstract getBestExecutionPrice(
    params: IBestExecutionPriceParams
  ): Promise<IBestExecutionPrice>;

  protected orderBookToPriceReducer(orderBook: IOrderBook, units: BigNumber) {
    /**
     * @todo: Implement better sorting algorithm here
     */
    const sortedOrderBook = orderBook.asks.sort((a, b) => {
      const first = new BigNumber(a[0]);
      const second = new BigNumber(b[0]);

      if (first.isEqualTo(second)) {
        return 0;
      } else {
        return first.isLessThan(second) ? -1 : 1;
      }
    });

    let orderPrice = new BigNumber(0);
    let unfulfilledunits = units;

    for (const sortedOrder of sortedOrderBook) {
      const orderSize = new BigNumber(sortedOrder[1]);
      const sellPrice = new BigNumber(sortedOrder[0]);

      if (orderSize.isGreaterThanOrEqualTo(unfulfilledunits)) {
        orderPrice = orderPrice.plus(sellPrice.times(unfulfilledunits));
        unfulfilledunits = new BigNumber(0);
        break;
      }

      orderPrice = orderPrice.plus(sellPrice.times(orderSize));
      unfulfilledunits = unfulfilledunits.minus(orderSize);
    }

    if (unfulfilledunits.isGreaterThan(0)) {
      throw new NotEnoughUnits("Not enough units available");
    }

    return {
      orderPrice,
    };
  }
}
