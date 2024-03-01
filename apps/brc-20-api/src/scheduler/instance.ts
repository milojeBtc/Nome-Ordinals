import { ToadScheduler } from "toad-scheduler"
import { watchBuyTxsJob } from "./watch-buys/watcher.js"

export const toadScheduler = new ToadScheduler()

toadScheduler.addSimpleIntervalJob(watchBuyTxsJob)
