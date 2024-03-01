import { determineUtxosForSpend } from "./coin-selection";
import { getUTXOsByIndex } from "../mempool/getUTXOByIndex";
import { getKeyByIndex } from "./server-keys";
import { networkMode } from "./network";
import needle from "needle";

export const buildPaymentTx = async ({
    keyIndex,
    amount,
    receiverAddress,
    feeRate,
}: {
    keyIndex: number;
    amount: number;
    receiverAddress: string;
    feeRate: number;
}) => {
    const key = getKeyByIndex(keyIndex);
    const btc = await import("@scure/btc-signer");
    const tx = new btc.Transaction();

    let UTXOs = await getUTXOsByIndex(keyIndex);
    if (!UTXOs.length) throw new Error("No inputs to sign");
    // const isSendingMax = utxo.value < amount;

    // const recommendedFee = await mempool.bitcoin.fees.getFeesRecommended();
    // only use the first one for now (just paranoia)
    UTXOs = UTXOs.slice(0, 1);

    const determineUtxosArgs = {
        amount,
        feeRate,
        recipient: receiverAddress,
        utxos: UTXOs,
    };

    const { inputs, outputs, fee } = determineUtxosForSpend(determineUtxosArgs);

    if (!inputs.length) throw new Error("No inputs to sign");
    if (!outputs.length) throw new Error("No outputs to sign");

    if (outputs.length > 2)
        throw new Error("Address reuse mode: wallet should have max 2 outputs");

    inputs.forEach((input) => {
        const p2wpkh = btc.p2wpkh(key.publicKey!, networkMode);

        tx.addInput({
            txid: input.txid,
            index: input.vout,
            sequence: 0,
            witnessUtxo: {
                // script = 0014 + pubKeyHash
                script: p2wpkh.script,
                amount: BigInt(input.value),
            },
        });
    });
    outputs.forEach((output) => {
        // When coin selection returns output with no address we assume it is
        // a change output
        if (!output.address) {
            tx.addOutputAddress(
                btc.getAddress("wpkh", key.privateKey!, networkMode)!,
                BigInt(output.value),
                networkMode
            );
            return;
        }
        tx.addOutputAddress(output.address, BigInt(output.value), networkMode);
    });

    tx.sign(key.privateKey!);
    tx.finalize();

    return { hex: tx.hex, fee, inputs, outputs };
};

export const broadcastPaymentTx = async ({ hex }: { hex: string }) => {
    const res = await needle("post", `${process.env.MEMPOOL_BASE_URL}/tx`, hex);
    return res.body as string;
};
