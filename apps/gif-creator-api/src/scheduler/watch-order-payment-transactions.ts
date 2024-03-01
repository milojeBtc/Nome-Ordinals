import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import prisma from "../lib/prisma-client";
import { Order, OrderStatus } from "@repo/gif-creator-db";
import { mempool } from "../lib/mempool/mempool-client";
import { handlePaidOrder } from "../lib/order-handlers/handle-paid-orders";
import { getAddressByIndex } from "../lib/payments/server-keys";
import { logger } from "../server";

const checkAddress = async ({
    address,
    order,
}: {
    address: string;
    order: Order;
}) => {
    const result = await mempool.bitcoin.addresses.getAddressTxsUtxo({
        address,
    });

    const [tx] = result;

    if (!tx) {
        return;
    }

    if (tx.status.confirmed) {
        logger.info(`Payment for order ${order.id} confirmed`);
        await handlePaidOrder(order);
    } else {
        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: OrderStatus.PAYMENT_PENDING,
                payment_tx_id: tx.txid,
            },
        });
    }
};

const watchOrderPaymentTransactionsTask = new AsyncTask(
    "Watch unpaid orders transactions",
    async () => {
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: [OrderStatus.UNPAID, OrderStatus.PAYMENT_PENDING],
                },
            },
        });

        for (const order of orders) {
            await checkAddress({
                address: (await getAddressByIndex(order.id))!,
                order,
            });
        }
    },
    (e) => logger.error(e),
);

export const watchOrderPaymentTransactionsJob = new SimpleIntervalJob(
    {
        minutes: 3,
        // seconds: 10,
    },
    watchOrderPaymentTransactionsTask,
    {
        preventOverrun: true,
    },
);
