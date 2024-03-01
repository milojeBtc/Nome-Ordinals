import { BitcoinNetworkType } from "sats-connect";

export const network =
  import.meta.env.VITE_APP_NETWORK === "testnet"
    ? BitcoinNetworkType.Testnet
    : BitcoinNetworkType.Mainnet;
