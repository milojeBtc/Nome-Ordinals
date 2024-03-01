const bitcoinMainnet = {
    bech32: "bc",
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
};

const bitcoinTestnet = {
    bech32: "tb",
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
};

export const networkMode =
    process.env.NODE_ENV === "production" ? bitcoinMainnet : bitcoinTestnet;
