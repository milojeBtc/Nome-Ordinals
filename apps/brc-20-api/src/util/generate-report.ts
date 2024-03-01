import { OrderStatus } from "@repo/brc-20-db"
import { prisma } from "../prisma/client.js"
import { PRICE, WL_PRICE } from "../constants.js"
import { WL_EXPIRATION_DATE_TIME } from "./isWhiteListOpen.js"

export async function generateReport() {
  const completeOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.COMPLETE,
    },
    include: {
      claim: true,
    },
  })

  const aggregates = await prisma.order.aggregate({
    _count: true,
    _avg: {
      feeRate: true,
    },
    _sum: {
      amount: true,
    },
    where: {
      status: OrderStatus.COMPLETE,
    },
  })

  const pricePerOrder = new Map<number, number>()

  for (const order of completeOrders) {
    let price = WL_PRICE
    if (order.createdAt > WL_EXPIRATION_DATE_TIME) {
      price = PRICE
    }

    price = price / 1000

    const chargedAmount = order.amount - (order.claim?.claimedAmount || 0)
    pricePerOrder.set(order.id, price * chargedAmount)
  }

  const formattedOrders = completeOrders.map((order) => {
    return {
      id: order.id,
      address: order.receiveAddress,
      amount: order.amount,
      price: pricePerOrder.get(order.id) || 0,
      feeRate: order.feeRate,
      createdAt: order.createdAt,
    }
  })

  const totalPaid = formattedOrders.reduce((acc, order) => acc + order.price, 0)

  return {
    totals: {
      price: totalPaid,
      orders: aggregates._count,
      feeRate: aggregates._avg.feeRate || 0,
      amount: aggregates._sum.amount || 0,
    },
    orders: formattedOrders,
  }
}
