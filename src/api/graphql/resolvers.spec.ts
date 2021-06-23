import BigNumber from "bignumber.js";
import { Exchange } from "./dataSources";
import { IContext, resolvers } from "./resolvers";
const queryParams = {
  exchangeRoutingParams: {
    btcAmount: "1",
  },
};

describe("resolvers", () => {
  const mockBinanaceResponse = jest.fn().mockResolvedValue({
    btcAmount: new BigNumber(1),
    exchange: Exchange.BINANCE,
    usdAmount: new BigNumber(2),
  });

  const mockCoinbaseResponse = jest.fn().mockResolvedValue({
    btcAmount: new BigNumber(1),
    exchange: Exchange.COINBASE,
    usdAmount: new BigNumber(1),
  });

  const mockKrakenResponse = jest.fn().mockResolvedValue({
    btcAmount: new BigNumber(1),
    exchange: Exchange.KRAKEN,
    usdAmount: new BigNumber(0.5),
  });

  let mockContext: IContext;
  beforeEach(() => {
    jest.clearAllMocks();

    mockContext = {
      dataSources: {
        binance: {
          getBestExecutionPrice: mockBinanaceResponse,
        },
        coinbase: {
          getBestExecutionPrice: mockCoinbaseResponse,
        },
        kraken: {
          getBestExecutionPrice: mockKrakenResponse,
        },
      },
    };
  });

  describe("when all data sources return their execution prices", () => {
    it("should call getBestExecutionPrice on all dataSources and return the cheapest price", async () => {
      const res = await resolvers.Query.exchangeRouting(
        null,
        queryParams,
        mockContext
      );
      expect(res).toEqual({
        btcAmount: new BigNumber(1),
        exchange: Exchange.KRAKEN,
        usdAmount: new BigNumber(0.5),
      });
    });
  });

  describe("when some datasources fail to return their execution prices", () => {
    it("should return cheapest execution price from datasources that returned data", async () => {
      mockBinanaceResponse.mockRejectedValue(new Error("Error"));
      mockCoinbaseResponse.mockRejectedValue(new Error("Error"));

      // @ts-ignore
      const res = await resolvers.Query.exchangeRouting(
        null,
        queryParams,
        mockContext
      );
      expect(res).toEqual({
        btcAmount: new BigNumber(1),
        exchange: Exchange.KRAKEN,
        usdAmount: new BigNumber(0.5),
      });
    });
  });

  describe("when all datasources fail to return their execution prices", () => {
    it("should throw", async () => {
      mockCoinbaseResponse.mockRejectedValue(new Error("Error"));
      mockBinanaceResponse.mockRejectedValue(new Error("Error"));
      mockKrakenResponse.mockRejectedValue(new Error("Error"));

      // @ts-ignore
      await expect(
        resolvers.Query.exchangeRouting(null, queryParams, mockContext)
      ).rejects.toThrow("Cannot find best execution price for 1 bitcoin");
    });
  });
});
