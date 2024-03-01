import { OrderStatus } from "@repo/brc-20-db"
import { prisma } from "../../prisma/client.js"

export async function fetchPendingOrders() {
  return prisma.order.findMany({
    where: {
      status: OrderStatus.UNPAID,
    },
    include: {
      claim: true,
    },
  })
}
