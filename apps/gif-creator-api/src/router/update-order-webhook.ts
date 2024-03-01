import { defaultEndpointsFactory } from "express-zod-api";
import ErrorResponse from "../lib/error-response";
import prisma from "../lib/prisma-client";
import z from "zod";
import { ordinalsBotWebhookPayloadSchema } from "../types/ordinals-bot";
// TODO: use ordinalsbot get order info api this is no longer useful
export const updateOrderWebhook = defaultEndpointsFactory.build({
    method: "post",
    input: ordinalsBotWebhookPayloadSchema,
    output: z.object({
        id: z.string(),
        success: z.boolean(),
    }),
    handler: async ({ input: payload }) => {
        //once it gets here

        if (!payload.token) {
            throw new ErrorResponse("Invalid order token", 401);
        }
        if (payload.state) {
            return {
                id: payload.id,
                success: true,
            };
        }

        const { tx, id, token, file } = payload;
        const existingFile = await prisma.ordinal.findFirst({
            where: {
                ordinals_bot_order_id: id,
                name: file.name,
                OR: [
                    {
                        image_files_order: {
                            update_token: token,
                        },
                    },
                    {
                        html_files_order: {
                            update_token: token,
                        },
                    },
                ],
            },
        });

        if (!existingFile) {
            throw new ErrorResponse("Invalid order token", 401);
        }

        if (existingFile.tx_id) {
            throw new ErrorResponse("Order already inscribed", 400);
        }

        const [tx_id, ordinal_index] = tx.inscription.split("i");
        await prisma.ordinal.update({
            where: {
                id: existingFile.id,
            },
            data: {
                tx_id,
                ordinal_index: Number(ordinal_index),
            },
        });

        return {
            id,
            success: true,
        };

        //inscribe the html file with the id
    },
});
