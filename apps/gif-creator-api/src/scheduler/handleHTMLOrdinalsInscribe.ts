import {
    Order,
    OrderStatus,
    Ordinal,
    TransactionStatus,
} from "@repo/gif-creator-db";
import prisma from "../lib/prisma-client";
import { ordinalsBotInscribe } from "../lib/ordinals-bot/inscribe";
import { base64 } from "@scure/base";
import { utf8ToBytes } from "@noble/hashes/utils";
import { hashFile } from "../lib/hashfile";
import { broadcastPaymentTx, buildPaymentTx } from "../lib/payments/bitcoin";
import { delay } from "../lib/util/delay";
import { buildGifHTML } from "../lib/gif/build-html";

const handleSingleOrder = async (
    order: Order & { image_ordinals: Ordinal[] },
) => {
    const gifHTML = buildGifHTML(
        `${order.id}.gif`,
        order.image_ordinals.map((ordinal) => ({
            duration: ordinal.duration,
            tx_id: ordinal.tx_id!,
            ordinal_index: ordinal.ordinal_index || 0,
        })),
    );

    const htmlBytes = utf8ToBytes(gifHTML);

    const size = htmlBytes.length;

    const htmlBase64 = base64.encode(htmlBytes);
    const htmlFiles = Array(order.quantity)
        .fill(`data:text/html;base64,${htmlBase64}`)
        .map((file: string, index) => ({
            dataURL: file,
            duration: 0,
            name: `${order.id}-${index + 1}.html`,
            size,
            type: "text/html",
        }));

    const ordinalsBotRes = await ordinalsBotInscribe({
        files: htmlFiles,
        order: {
            fee_rate: order.fee_rate,
            rarity: order.rarity,
            receiver_address: order.receiver_address,
            update_token: order.update_token!,
        },
    });

    const htmlHash = await hashFile(htmlBase64);

    for (const file of htmlFiles) {
        await prisma.ordinal.create({
            data: {
                html_files_order_id: order.id,
                name: file.name,
                size: file.size,
                hash: htmlHash,
                duration: file.duration,
                type: file.type,
                ordinals_bot_order_id: ordinalsBotRes.id,
            },
        });
    }

    const paymentTx = await buildPaymentTx({
        keyIndex: order.id,
        amount: ordinalsBotRes.charge.amount,
        receiverAddress: ordinalsBotRes.charge.address,
        feeRate: order.fee_rate,
    });

    await broadcastPaymentTx({ hex: paymentTx.hex });

    await prisma.order.update({
        where: {
            id: order.id,
        },
        data: {
            status: OrderStatus.HTML_ORDINALS_PENDING,
        },
    });
};

export const checkAndInscribeCompleteOrders = async () => {
    const imageCompleteOrdinals = await prisma.order.findMany({
        where: {
            image_ordinals: {
                every: {
                    tx_status: TransactionStatus.CONFIRMED,
                },
            },
            status: OrderStatus.IMAGE_ORDINALS_PENDING,
        },
        include: {
            image_ordinals: true,
        },
    });

    for (const order of imageCompleteOrdinals) {
        await handleSingleOrder(order);
        await delay(5000);
    }
};
