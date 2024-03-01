import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";
import { networkMode } from "./network";

export const getAddressByIndex = async (keyIndex: number) => {
    const key = getKeyByIndex(keyIndex);
    const btcSigner = await import("@scure/btc-signer");
    return btcSigner.getAddress("wpkh", key.privateKey!, networkMode);
};

const getHDKey = () => {
    const mnemonic = process.env.PAYMENT_MNEMONIC!;

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    return HDKey.fromMasterSeed(seed);
};

const getDerivationPath = (keyIndex: number) => {
    let accountIndex = 0;
    if (keyIndex > 209_496_7296) {
        accountIndex = Math.floor(keyIndex / 209_496_7296);
    }
    return `m/84'/0'/${accountIndex}'`;
};

export const getKeyByIndex = (keyIndex: number) => {
    const hdKey = getHDKey();
    const derivationPath = getDerivationPath(keyIndex);
    return hdKey.derive(derivationPath).deriveChild(0).deriveChild(keyIndex);
};
