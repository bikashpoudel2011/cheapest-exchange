import BigNumber from "bignumber.js";
import { provideKrakenDataSet } from "./../../fixtures";
import { Exchange } from "./IExchange";
import { Kraken } from "./Kraken";

const krakenDataSource = new Kraken();
describe("Kraken", () => {
  describe("getBestExecutionPrice", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // @ts-ignore
      krakenDataSource.get = jest
        .fn()
        .mockResolvedValue(provideKrakenDataSet());
    });

    describe("When orderbook returned is able to fulfill the order", () => {
      it("should return correct USD value for specified BTC amount", async () => {
        const bestExecutionPrice = await krakenDataSource.getBestExecutionPrice(
          {
            btcAmount: new BigNumber(3),
          }
        );
        expect(bestExecutionPrice).toEqual({
          btcAmount: new BigNumber(3),
          usdAmount: new BigNumber(35),
          exchange: Exchange.KRAKEN,
        });
      });

      it("should return correct value for BTC amount with decimal points", async () => {
        const bestExecutionPrice = await krakenDataSource.getBestExecutionPrice(
          {
            btcAmount: new BigNumber(0.00000001),
          }
        );
        expect(bestExecutionPrice).toEqual({
          btcAmount: new BigNumber(0.00000001),
          usdAmount: new BigNumber(0.00000001).times(11),
          exchange: Exchange.KRAKEN,
        });
      });
    });

    describe("When orderbook returned is not able to fulfull the order", () => {
      it("should throw", async () => {
        await expect(
          krakenDataSource.getBestExecutionPrice({
            btcAmount: new BigNumber(5000),
          })
        ).rejects.toThrow("Not enough units available");
      });
    });

    describe("When Kraken api throws", () => {
      it("should throw", async () => {
        // @ts-ignore
        krakenDataSource.get = jest.fn().mockRejectedValue(new Error("Error"));

        await expect(
          krakenDataSource.getBestExecutionPrice({
            btcAmount: new BigNumber(5000),
          })
        ).rejects.toThrow("Error");
      });
    });
  });
});
