import { AsyncTask, SimpleIntervalJob } from "toad-scheduler"
import { logger } from "../../server.js"

import { isOrderExpired } from "../../util/orders/isOrderExpired.js"
import { fetchPendingOrders } from "./fetchPendingOrders.js"
import { processOrder } from "./processOrder.js"
import { updateProgress } from "./updateProgress.js"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const watchBuyTxsTask = new AsyncTask(
  "watchBuyTxsTask",
  async () => {
    const pendingOrders = (await fetchPendingOrders()).filter(
      (order) => !isOrderExpired(order),
    )
    for (const order of pendingOrders) {
      logger.info(`Processing order ${order.id}`)
      await processOrder({ order })
      await delay(1000)
    }

    if (pendingOrders.length > 0) {
      await updateProgress()
    }
  },
  (err) => {
    logger.error(err)
  },
)

export const watchBuyTxsJob = new SimpleIntervalJob(
  {
    minutes: 3,
  },
  watchBuyTxsTask,
)
