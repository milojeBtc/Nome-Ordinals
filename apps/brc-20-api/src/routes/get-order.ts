import { defaultEndpointsFactory, ez } from "express-zod-api"
import { z } from "zod"
import {
  idSchema,
  validBTCAddress,
  validBuyAmount,
  validFeeRate,
  validTaprootAddress,
} from "../util/zod-extras.js"
import { prisma } from "../prisma/client.js"
import createHttpError from "http-errors"
import { getKeyForIndex } from "../bitcoin/keys/server-keys.js"
import { getPaymentAddress } from "../bitcoin/inscriptions/get-payment-address.js"
import { OrderStatus } from "@repo/brc-20-db"

export const getOrderEndpoint = defaultEndpointsFactory.build({
  method: "get",
  shortDescription: "Get order",
  description: "Get order by id",
  input: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  output: z.object({
    id: idSchema,
    status: z.nativeEnum(OrderStatus),
    amount: validBuyAmount,
    feeRate: validFeeRate,
    createdAt: ez.dateOut(),
    updatedAt: ez.dateOut(),
    paymentAddress: validTaprootAddress,
    paymentTxId: z.nullable(z.string()),
    transferTxId: z.nullable(z.string()),
    receiveAddress: validBTCAddress,
  }),
  async handler({ input: { id } }) {
    const order = await prisma.order.findFirst({
      where: { id },
    })
    if (!order) {
      throw createHttpError(404, "Order not found")
    }
    const key = await getKeyForIndex(order.id, true)
    const { inscribingAddress } = await getPaymentAddress(key, order.amount)
    return {
      ...order,
      paymentAddress: inscribingAddress,
    }
  },
})
