import needle from "needle";
import { buildGifHTML } from "./gif/build-html";

import { buildOrdinalsBotError } from "./error-response";
import { OrdinalsBotErrorResponse } from "../types/ordinals-bot";
import { BtcSizeFeeEstimator } from "./payments/btc-size-fee-estimator";

export type ordinalsBotPriceRes = {
    chainFee: number;
    serviceFee: number;
    baseFee: number;
    rareSatsFee: number;
    additionalFee: number;
    postage: number;
    amount: number;
    totalFee: number;
    status: never;
};

export const getOrdinalsBotPrice = async ({
    size,
    fee,
    quantity = 1,
    rareSats = "random",
}: {
    size: number;
    fee: number;
    quantity?: number;
    rareSats?: string;
}) => {
    const searchParams = new URLSearchParams({
        size: String(size),
        fee: String(fee),
        count: String(quantity),
        rareSats: rareSats,
        lowPostage: "true",
        baseFee: process.env.ORDINALS_BOT_BASE_FEE || "0",
    });

    const headers: { [x: string]: string } = {
        Accept: "application/json",
    };
    const apiKey = process.env.ORDINALS_BOT_API_KEY;
    if (apiKey) {
        headers["x-api-key"] = apiKey;
    }
    const res = await needle(
        "get",
        `${process.env.ORDINALS_BOT_API_BASE_URL}/price?${searchParams}`,
        {
            json: true,
            headers,
        }
    );
    const priceData: ordinalsBotPriceRes = res.body;
    const errorData: OrdinalsBotErrorResponse = res.body;
    if (errorData.status === "error") {
        throw buildOrdinalsBotError(errorData as OrdinalsBotErrorResponse);
    } else {
        return priceData;
    }
};

const getOrdinalsBotBitcoinFees = (feeRate: number) => {
    const txSizer = new BtcSizeFeeEstimator();
    const { txVBytes } = txSizer.calcTxSize({
        input_count: 1,
        p2wpkh_output_count: 1,
        p2sh_output_count: 1,
    });

    return txVBytes * feeRate;
};

export const calculatePrice = async ({
    fee,
    quantity = 1,
    rareSats,
    imageFileSizes,
}: {
    fee: number;
    quantity?: number;
    rareSats?: string;
    imageFileSizes: number[];
}) => {
    const mappedFiles = imageFileSizes.map(() => ({
        duration: 1000,
        ordinal_index: 0,
        tx_id: "d".repeat(64),
    }));
    const htmlSize = buildGifHTML("image.gif", mappedFiles).length;
    let totalImagesPrice = 0;
    for (const imageSize of imageFileSizes) {
        const { totalFee } = await getOrdinalsBotPrice({
            size: imageSize,
            fee,
            rareSats,
        });
        totalImagesPrice += totalFee;
    }

    const { totalFee: htmlPrice } = await getOrdinalsBotPrice({
        size: htmlSize,
        fee,
        rareSats,
    });

    const royalties = Number(process.env.REFERRAL_FEE);
    const paymentTxFees = getOrdinalsBotBitcoinFees(fee);
    const totalPaymentFees = paymentTxFees * 2;
    const totalHTMLPrice = htmlPrice * quantity;
    const totalOrdinalBotFees = totalImagesPrice + totalHTMLPrice;
    const totalServiceFees = royalties + totalPaymentFees;
    const totalFee = totalOrdinalBotFees + totalServiceFees;

    return {
        totalFee,
        totalImagesPrice,
        htmlPrice,
        htmlSize,
    };
};
