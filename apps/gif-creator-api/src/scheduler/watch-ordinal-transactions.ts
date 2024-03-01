import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import prisma from "../lib/prisma-client";
import { OrderStatus, TransactionStatus } from "@repo/gif-creator-db";
import needle from "needle";
import { MempoolTx } from "../types/mempool";
import { checkAndInscribeCompleteOrders } from "./handleHTMLOrdinalsInscribe";
import { logger } from "../server";

const checkTx = async (txId: string) => {
    const result = await needle(
        "get",
        `${process.env.MEMPOOL_BASE_URL}/tx/${txId}`,
    );
    const tx = result.body as MempoolTx;

    if (!tx.status.confirmed) {
        return;
    }
    await prisma.ordinal.update({
        where: {
            tx_id: txId,
        },
        data: {
            tx_status: TransactionStatus.CONFIRMED,
        },
    });

    await prisma.order.updateMany({
        where: {
            status: OrderStatus.HTML_ORDINALS_PENDING,
            html_ordinals: {
                every: {
                    tx_status: TransactionStatus.CONFIRMED,
                },
            },
        },
        data: {
            status: OrderStatus.READY,
        },
    });

    await checkAndInscribeCompleteOrders();
};

const watchOrdinalTransactionsTask = new AsyncTask(
    "Watch ordinal transactions",
    async () => {
        const unconfirmedTxs = await prisma.ordinal.findMany({
            where: {
                tx_status: TransactionStatus.PENDING,
                tx_id: {
                    not: null,
                },
            },
        });

        for (const tx of unconfirmedTxs) {
            await checkTx(tx.tx_id!);
        }
    },
    (e) => logger.error(e),
);

export const watchOrdinalTransactionsJob = new SimpleIntervalJob(
    {
        minutes: 3,
        // seconds: 10,
    },
    watchOrdinalTransactionsTask,
    {
        preventOverrun: true,
    },
);
