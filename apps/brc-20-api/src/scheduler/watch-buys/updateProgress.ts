import { OrderStatus } from "@repo/brc-20-db"
import { redisClient } from "../../middlewares/rate-limiter.js"
import { prisma } from "../../prisma/client.js"

export const updateProgress = async () => {
  const {
    _sum: { amount: progress },
  } = await prisma.order.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: OrderStatus.COMPLETE,
    },
  })
  await setProgress(progress || 0)
}

const setProgress = async (progress: number) => {
  redisClient.set("sales:progress", progress)
}

export const getProgress = async () => {
  const progress = await redisClient.get("sales:progress")
  return progress ? parseInt(progress) : 0
}
