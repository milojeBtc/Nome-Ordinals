export const bitcoinMainnet = {
  bech32: "bc",
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
}

export const bitcoinTestnet = {
  bech32: "tb",
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

export const networkMode =
  process.env.NETWORK_MODE === "mainnet" ? bitcoinMainnet : bitcoinTestnet
