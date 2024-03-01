import { Order } from "@repo/brc-20-db"

export function isOrderExpired(order: Order) {
  return order.expiresAt.getTime() < Date.now()
}
