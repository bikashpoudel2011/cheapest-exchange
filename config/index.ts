process.env.NODE_CONFIG_DIR = __dirname;

import nodeconfig from "config";

interface IConfig {
  api: {
    binance: string;
    coinbase: string;
    kraken: string;
  }
}

export const config: IConfig = {
  api: nodeconfig.get("api")
};