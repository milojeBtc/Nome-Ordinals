import { Claim, Order, OrderStatus } from "@repo/brc-20-db"
import { prisma } from "../../prisma/client.js"

export async function markOrderComplete({
  order: { id: orderId, claim },
  transferTxId,
  paymentTxId,
}: {
  order: Order & { claim: Claim | null }
  transferTxId: string
  paymentTxId: string
}) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      paymentTxId,
      transferTxId,
      status: OrderStatus.COMPLETE,
    },
  })

  if (!claim) {
    return
  }

  const { claimedAmount, freeAmount } = claim
  if (freeAmount && claimedAmount === 0) {
    await prisma.claim.update({
      where: {
        id: claim.id,
      },
      data: {
        claimedAmount: freeAmount,
      },
    })
  }
}
