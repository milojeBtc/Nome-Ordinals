import { getAddressByIndex } from "../payments/server-keys";
import { mempool } from "./mempool-client";

export const getUTXOsByIndex = async (keyIndex: number) => {
    const address = await getAddressByIndex(keyIndex);
    return mempool.bitcoin.addresses.getAddressTxsUtxo({ address: address! });
};
