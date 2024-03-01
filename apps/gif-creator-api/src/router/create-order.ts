import { defaultEndpointsFactory } from "express-zod-api";
import { v4 } from "uuid";
import z from "zod";
import { calculatePrice } from "../lib/calculatePrice";
import { ordinalsBotInscribe } from "../lib/ordinals-bot/inscribe";
import { hashFile } from "../lib/hashfile";
import prisma from "../lib/prisma-client";
import { getAddressByIndex } from "../lib/payments/server-keys";
import { available_rarity } from "../constants/rarity";
import { safeInt, taprootAddress } from "../types/zod-extras";

const maxFileSize = 200_000;
const base64Overhead = 4 * (maxFileSize / 3);
const fileData = z.object({
    name: z.string().max(150, "File name too long"),
    size: safeInt.max(maxFileSize, "File too large"),
    dataURL: z.string().max(+base64Overhead, "File too large"),
    duration: safeInt,
    type: z
        .string()
        .refine((x) => x === "image/webp", "Only webp images are supported"),
});

export const createOrderEndpoint = defaultEndpointsFactory.build({
    method: "post",
    input: z.object({
        files: z.array(fileData).min(1).nonempty("Must have at least one file"),
        rarity: z.enum(available_rarity).default("random"),
        receiverAddress: taprootAddress,
        quantity: safeInt.default(1),
        feeRate: safeInt.min(1).max(1000, "No way brah too much fee monies"),
    }),
    output: z.object({
        id: safeInt,
        payment_details: z.object({
            address: z.string(),
            amount: safeInt,
        }),
    }),
    handler: async ({
        input: { files, rarity, receiverAddress, quantity, feeRate },
    }) => {
        const namedFiles = files.map((file) => ({
            ...file,
            name: `${v4()}.${file.name.split(".").pop()}`,
        }));

        const detailed_fees = await calculatePrice({
            fee: feeRate,
            imageFileSizes: files.map((file) => file.size),
            quantity,
            rareSats: rarity,
        });
        //successful order
        //save to the db
        const orderToken = v4();

        const orderResponseData = await ordinalsBotInscribe({
            files: namedFiles,
            order: {
                fee_rate: feeRate,
                rarity,
                receiver_address: receiverAddress,
                update_token: orderToken,
            },
        });

        const newOrder = await prisma.order.create({
            data: {
                receiver_address: receiverAddress,
                update_token: orderToken,
                fee_rate: feeRate,
                quantity: quantity || 1,
                rarity,
                total_fee: detailed_fees.totalFee,
            },
        });
        for (const file of namedFiles) {
            await prisma.ordinal.create({
                data: {
                    image_files_order_id: newOrder.id,
                    name: file.name,
                    size: file.size,
                    hash: await hashFile(file.dataURL),
                    duration: file.duration,
                    type: file.type,
                    ordinals_bot_order_id: orderResponseData.id,
                },
            });
        }
        //send response to client
        return {
            id: newOrder.id,
            payment_details: {
                address: (await getAddressByIndex(newOrder.id))!,
                amount: detailed_fees.totalFee,
            },
        };
    },
});
