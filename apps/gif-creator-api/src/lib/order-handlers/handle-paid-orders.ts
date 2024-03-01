import { Order, OrderStatus } from "@repo/gif-creator-db";
import prisma from "../prisma-client";
import {
    OrdinalsBotCreateOrderResponse,
    OrdinalsBotErrorResponse,
} from "../../types/ordinals-bot";
import needle from "needle";
import { broadcastPaymentTx, buildPaymentTx } from "../payments/bitcoin";
import { buildOrdinalsBotError } from "../error-response";
import { logger } from "../../server";

export const handlePaidOrder = async (order: Order) => {
    const imageOrdinal = await prisma.ordinal.findFirst({
        where: {
            image_files_order_id: order.id,
        },
    });

    const ordinalsBotOrder = await needle(
        "get",
        `${process.env.ORDINALS_BOT_API_BASE_URL}/order?id=${
            imageOrdinal!.ordinals_bot_order_id
        }`,
    );

    const ordinalsBotOrderData = ordinalsBotOrder.body as
        | OrdinalsBotCreateOrderResponse
        | OrdinalsBotErrorResponse;

    if (ordinalsBotOrderData.status === "ok") {
        logger.info(
            `sending ${ordinalsBotOrderData.charge.amount} to ${ordinalsBotOrderData.charge.address}`,
        );
        const { hex } = await buildPaymentTx({
            keyIndex: order.id,
            amount: ordinalsBotOrderData.charge.amount,
            feeRate: order.fee_rate,
            receiverAddress: ordinalsBotOrderData.charge.address,
        });
        await broadcastPaymentTx({ hex });
        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: OrderStatus.IMAGE_ORDINALS_PENDING,
            },
        });
    } else {
        throw buildOrdinalsBotError(ordinalsBotOrderData);
    }
};
