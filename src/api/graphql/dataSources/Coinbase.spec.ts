import BigNumber from "bignumber.js";
import { execute } from "graphql";
import { provideCoinbaseDataSet } from "../../fixtures";
import { Coinbase } from "./Coinbase";
import { Exchange } from "./IExchange";

const coinbaseDataSorce = new Coinbase();
describe("Coinbase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    coinbaseDataSorce.get = jest
      .fn()
      .mockResolvedValue(provideCoinbaseDataSet());
  });

  describe("getBestExecutionPrice", () => {
    describe("When API level 2 orderbook is able to fulfill the order", () => {
      it("should return correct USD value for specified BTC amount", async () => {
        const bestExecutionPrice = await coinbaseDataSorce.getBestExecutionPrice(
          {
            btcAmount: new BigNumber(3),
          }
        );
        expect(bestExecutionPrice).toEqual({
          btcAmount: new BigNumber(3),
          usdAmount: new BigNumber(120),
          exchange: Exchange.COINBASE,
        });
      });

      it("should return correct value for BTC amount with decimal points", async () => {
        const bestExecutionPrice = await coinbaseDataSorce.getBestExecutionPrice(
          {
            btcAmount: new BigNumber(0.00000001),
          }
        );
        expect(bestExecutionPrice).toEqual({
          btcAmount: new BigNumber(0.00000001),
          usdAmount: new BigNumber(0.00000001).times(30),
          exchange: Exchange.COINBASE,
        });
      });
    });

    describe("When API level 2 orderbook is not able to fulfill the order", () => {
      beforeEach(() => {
        const newDataSet = {
          asks: [
            ...provideCoinbaseDataSet().asks,
            ...provideCoinbaseDataSet().asks,
          ],
        };
        // @ts-ignore
        coinbaseDataSorce.get = jest.fn().mockResolvedValueOnce(newDataSet);
      });

      it("should query API level 3", async () => {
        const bestExecutionPrice = await coinbaseDataSorce.getBestExecutionPrice(
          {
            btcAmount: new BigNumber(40),
          }
        );

        expect(bestExecutionPrice).toEqual({
          btcAmount: new BigNumber(40),
          usdAmount: new BigNumber(2264),
          exchange: Exchange.COINBASE,
        });
      });
    });

    describe("When orderbook returned is not able to fulfull the order", () => {
      it("should throw", async () => {
        await expect(
          coinbaseDataSorce.getBestExecutionPrice({
            btcAmount: new BigNumber(5000),
          })
        ).rejects.toThrow("Not enough units available");
      });
    });

    describe("When Coinbase api throws", () => {
      it("should throw", async () => {
        // @ts-ignore
        coinbaseDataSorce.get = jest.fn().mockRejectedValue(new Error("Error"));

        await expect(
          coinbaseDataSorce.getBestExecutionPrice({
            btcAmount: new BigNumber(5000),
          })
        ).rejects.toThrow("Error");
      });
    });
  });
});
