import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import { getAddressInfo } from "bitcoin-address-validation";
import { BtcSizeFeeEstimator } from "./btc-size-fee-estimator";
import { validate } from "bitcoin-address-validation";
export const BTC_P2WPKH_DUST_AMOUNT = 294;

export function determineUtxosForSpend({
    amount,
    feeRate,
    recipient,
    utxos,
}: {
    amount: number;
    feeRate: number;
    recipient: string;
    utxos: AddressTxsUtxo[];
}) {
    if (!validate(recipient))
        throw new Error("Cannot calculate spend of invalid address type");

    const addressInfo = getAddressInfo(recipient);

    const orderedUtxos = utxos
        .filter((utxo) => utxo.value >= BTC_P2WPKH_DUST_AMOUNT)
        .sort((a, b) => b.value - a.value);

    const txSizer = new BtcSizeFeeEstimator();

    // txSizer.prepareParams({
    //     p2pkh_output_count:
    // })

    const neededUtxos: AddressTxsUtxo[] = [];
    let sum = BigInt(0);
    let sizeInfo = null;

    for (const utxo of orderedUtxos) {
        sizeInfo = txSizer.calcTxSize({
            // Only p2wpkh is supported by the wallet
            input_script: "p2wpkh",
            input_count: neededUtxos.length + 1,
            // From the address of the recipient, we infer the output type
            [addressInfo.type + "_output_count"]: 1,
            p2wpkh_output_count: 1,
        });
        if (
            sum >=
            BigInt(amount) + BigInt(Math.ceil(sizeInfo.txVBytes * feeRate))
        )
            break;

        sum += BigInt(utxo.value);
        neededUtxos.push(utxo);
    }

    if (!sizeInfo) throw new Error("Transaction size must be defined");

    const fee = Math.ceil(sizeInfo.txVBytes * feeRate);

    const outputs = [
        // outputs[0] = the desired amount going to recipient
        { value: BigInt(amount), address: recipient },
        // outputs[1] = the remainder to be returned to a change address
        { value: sum - BigInt(amount) - BigInt(fee) },
    ];

    return {
        orderedUtxos,
        inputs: neededUtxos,
        outputs,
        size: sizeInfo.txVBytes,
        fee,
    };
}
