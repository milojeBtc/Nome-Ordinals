import { OrderStatus } from "@repo/brc-20-db"
import { prisma } from "../../prisma/client.js"
import { getInscriptionUTXOs } from "../../scheduler/watch-buys/getInscriptionUTXOs.js"
import { getKeyForIndex } from "../../bitcoin/keys/server-keys.js"

export async function checkOrderDuplicate(order: {
  amount: number
  claimId: number | null
  receiveAddress: string
}) {
  const existingOrder = await prisma.order.findFirst({
    where: {
      receiveAddress: order.receiveAddress,
      amount: order.amount,
      claimId: order.claimId,
      status: OrderStatus.UNPAID,
    },
    include: {
      claim: true,
    },
  })
  if (!existingOrder) return null

  if (existingOrder.expiresAt < new Date()) {
    return null
  }

  const orderKey = await getKeyForIndex(existingOrder.id, true)
  const orderUTXOs = await getInscriptionUTXOs({
    order: existingOrder,
    orderKey,
  })

  if (orderUTXOs.length) {
    return null
  }
  return existingOrder
}
