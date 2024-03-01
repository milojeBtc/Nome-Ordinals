import { ToadScheduler } from "toad-scheduler";
import { watchOrdinalTransactionsJob } from "./watch-ordinal-transactions";

import { watchOrderPaymentTransactionsJob } from "./watch-order-payment-transactions";

export const toadScheduler = new ToadScheduler();

toadScheduler.addSimpleIntervalJob(watchOrdinalTransactionsJob);

toadScheduler.addSimpleIntervalJob(watchOrderPaymentTransactionsJob);
