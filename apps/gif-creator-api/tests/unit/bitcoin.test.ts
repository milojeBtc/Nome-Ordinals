import { wordlist } from "@scure/bip39/wordlists/english";

import { generateMnemonic } from "@scure/bip39";
import { beforeEach, describe, expect, it, vi, Mock } from "vitest";

import { getUTXOsByIndex } from "../../src/lib/mempool/getUTXOByIndex";
import { buildPaymentTx } from "../../src/lib/payments/bitcoin";
import { BtcSizeFeeEstimator } from "../../src/lib/payments/btc-size-fee-estimator";
import { getAddressInfo } from "bitcoin-address-validation";

vi.mock("../../src/lib/mempool/mempool-client");
vi.mock("../../src/lib/mempool/getUTXOByIndex", () => {
    return {
        getUTXOsByIndex: vi.fn(),
    };
});

const mockMnemonic = generateMnemonic(wordlist);
vi.stubEnv("PAYMENT_MNEMONIC", mockMnemonic);

describe("buildPaymentTx", async () => {
    const mockArgs = {
        keyIndex: 0,
        amount: 62_412,
        receiverAddress: "2NAVZVdwCV1NSf72mhHpcUqPwMECu3uEZUy",
        feeRate: 5.82,
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should build a payment transaction with the expected inputs, outputs, and fee", async () => {
        (getUTXOsByIndex as Mock).mockReturnValueOnce([
            {
                txid: "b40c08d629c55d384511aed9ce475063336c444bcbee1ea0ecc82fa601e9ee96",
                vout: 0,
                value: 79470,
            },
        ]);

        const { hex, fee } = await buildPaymentTx(mockArgs);

        expect(hex).toBeDefined();
        expect(fee).toEqual(824);
    });

    const keyIndex = 0;
    const amount = 10000; // in satoshis
    const receiverAddress = mockArgs.receiverAddress;
    const feeRate = 250; // in satoshis per byte

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should build a transaction with correct inputs and outputs", async () => {
        const utxo = {
            txid: "b40c08d629c55d384511aed9ce475063336c444bcbee1ea0ecc82fa601e9ee96",
            vout: 1,
            value: 100000,
        };
        (getUTXOsByIndex as Mock).mockReturnValueOnce([utxo]);

        const { inputs, outputs } = await buildPaymentTx({
            keyIndex,
            amount,
            receiverAddress,
            feeRate,
        });

        const receiverAddressInfo = getAddressInfo(receiverAddress);

        const { txVBytes } = new BtcSizeFeeEstimator().calcTxSize({
            input_count: 1,
            input_script: "p2wpkh",
            [`${receiverAddressInfo.type}_output_count`]: 1,
            p2wpkh_output_count: 1,
        });

        expect(inputs).toEqual([
            { txid: utxo.txid, vout: utxo.vout, value: utxo.value },
        ]);
        expect(outputs).toEqual([
            { address: receiverAddress, value: BigInt(amount) },
            {
                address: undefined,
                value: BigInt(
                    utxo.value - amount - Math.ceil(txVBytes * feeRate)
                ),
            },
        ]);
    });

    it("should throw an error if no inputs are available", async () => {
        (getUTXOsByIndex as Mock).mockReturnValueOnce([]);
        expect(
            buildPaymentTx({ keyIndex, amount, receiverAddress, feeRate })
        ).rejects.toThrow("No inputs to sign");
    });
});
