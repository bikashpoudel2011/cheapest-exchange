import BigNumber from "bignumber.js";
import { provideBinanaceDataSet } from "./../../fixtures";
import { Binance } from "./Binance";
import { Exchange } from "./IExchange";

const binanaceDataSource = new Binance();
describe("Binanace", () => {
  describe("getBestExecutionPrice", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // @ts-ignore
      binanaceDataSource.get = jest
        .fn()
        .mockResolvedValue(provideBinanaceDataSet());
    });

    describe("When orderbook returned is able to fulfill the order", () => {
      it("should return correct USD value for specified BTC amount", async () => {
        const bestExecutionPrice = await binanaceDataSource.getBestExecutionPrice(
          {
            btcAmount: new BigNumber(5),
          }
        );
        expect(bestExecutionPrice).toEqual({
          btcAmount: new BigNumber(5),
          usdAmount: new BigNumber(34),
          exchange: Exchange.BINANCE,
        });
      });

      it("should return correct value for BTC amount with decimal points", async () => {
        const bestExecutionPrice = await binanaceDataSource.getBestExecutionPrice(
          {
            btcAmount: new BigNumber(0.00000001),
          }
        );
        expect(bestExecutionPrice).toEqual({
          btcAmount: new BigNumber(0.00000001),
          usdAmount: new BigNumber(0.00000001).times(3),
          exchange: Exchange.BINANCE,
        });
      });
    });

    describe("When orderbook returned is not able to fulfull the order", () => {
      it("should throw", async () => {
        await expect(
          binanaceDataSource.getBestExecutionPrice({
            btcAmount: new BigNumber(5000),
          })
        ).rejects.toThrow("Not enough units available");
      });
    });

    describe("When Binance api throws", () => {
      it("should throw", async () => {
        // @ts-ignore
        binanaceDataSource.get = jest
          .fn()
          .mockRejectedValue(new Error("Error"));

        await expect(
          binanaceDataSource.getBestExecutionPrice({
            btcAmount: new BigNumber(5000),
          })
        ).rejects.toThrow("Error");
      });
    });
  });
});
