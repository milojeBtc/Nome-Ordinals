import { defaultEndpointsFactory, ez } from "express-zod-api";
import { z } from "zod";
import prisma from "../lib/prisma-client";
import { getAddressByIndex } from "../lib/payments/server-keys";
import { OrderStatus } from "@repo/gif-creator-db";
import { safeInt, taprootAddress } from "../types/zod-extras";

export const getOrdersEndpoint = defaultEndpointsFactory.build({
    method: "get",
    input: z.object({
        address: taprootAddress,
        page: z.number().safe().min(1).default(1),
    }),
    output: z.object({
        data: z.array(
            z.object({
                receiver_address: z.string(),
                created_at: ez.dateOut(),
                id: safeInt,
                updated_at: ez.dateOut(),
                status: z.nativeEnum(OrderStatus),
                quantity: safeInt,
                total_fee: safeInt,
                payment_tx_id: z.string().nullable(),
                payment_details: z.object({
                    address: z.string(),
                    amount: safeInt,
                }),
            }),
        ),
        total: z.number().safe().min(0),
    }),
    handler: async ({ input: { address, page } }) => {
        //first get the user address

        //then check if the user has an order already and send back those details
        const orders = await prisma.order.findMany({
            where: {
                receiver_address: address,
            },
            select: {
                receiver_address: true,
                created_at: true,
                id: true,
                updated_at: true,
                status: true,
                quantity: true,
                total_fee: true,
                payment_tx_id: true,
            },
            take: 10,
            skip: (page - 1) * 10,
        });

        const total = await prisma.order.count({
            where: {
                receiver_address: address,
            },
        });

        return {
            data: await Promise.all(
                orders.map(async (order) => ({
                    ...order,
                    payment_details: {
                        address: (await getAddressByIndex(order.id))!,
                        amount: order.total_fee,
                    },
                })),
            ),
            total,
        };
    },
});
