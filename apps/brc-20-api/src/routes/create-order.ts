import { defaultEndpointsFactory, ez } from "express-zod-api"
import { rateLimitStore } from "../middlewares/rate-limiter.js"
import { z } from "zod"
import {
  idSchema,
  validBTCAddress,
  validBuyAmount,
  validFeeRate,
  validTaprootAddress,
} from "../util/zod-extras.js"
import rateLimit from "express-rate-limit"
import { prisma } from "../prisma/client.js"
import { calculatePrice } from "../util/calculate-price.js"
import { getPaymentAddress } from "../bitcoin/inscriptions/get-payment-address.js"
import { getKeyForIndex } from "../bitcoin/keys/server-keys.js"
import { getWLBenefits } from "../util/get-wl-benefits.js"
import { ORDER_EXPIRATION_TIME } from "../constants.js"
import { isWhitelistOpen } from "../util/isWhiteListOpen.js"
import { Order } from "@repo/brc-20-db"
import { checkOrderDuplicate } from "../util/orders/isOrderDuplicate.js"
import createHttpError from "http-errors"

function renewOrderExpiryDate(id: number) {
  return prisma.order.update({
    where: {
      id,
    },
    data: {
      expiresAt: new Date(Date.now() + ORDER_EXPIRATION_TIME),
    },
  })
}

export const createOrderEndpoint = defaultEndpointsFactory
  .addExpressMiddleware(
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      store: rateLimitStore,
      keyGenerator(request): string {
        if (!request.ip) {
          console.error("Warning: request.ip is missing!")
          return request.socket.remoteAddress!
        }

        return request.ip.replace(/:\d+[^:]*$/, "")
      },
    }),
  )
  .build({
    shortDescription: "Create a new order",
    description:
      "Create a brc20 buy order based on amount and whitelist status",
    method: "post",
    input: z.object({
      receiveAddress: validBTCAddress,
      amount: validBuyAmount,
      feeRate: validFeeRate,
    }),
    output: z.object({
      id: idSchema,
      paymentAddress: validTaprootAddress,
      receiveAddress: validBTCAddress,
      createdAt: ez.dateOut(),
      updatedAt: ez.dateOut(),
      totalPrice: z.number().describe("Total order price in sats"),
    }),
    handler: async ({ input: { amount, receiveAddress, feeRate } }) => {
      const wlOpen = await isWhitelistOpen()

      const existingClaim = await prisma.claim.findFirst({
        where: {
          ordinalAddress: receiveAddress,
        },
      })
      let order: Order | null = null
      if (wlOpen) {
        if (!existingClaim) {
          throw createHttpError(400, "Invalid claim address")
        }
      }

      const { price, freeAmount } = await getWLBenefits(existingClaim)

      const duplicate = await checkOrderDuplicate({
        amount,
        claimId: existingClaim?.id || null,
        receiveAddress,
      })

      if (duplicate) {
        order = await renewOrderExpiryDate(duplicate.id)
      }

      // ensure that the user receives at least the free amount
      if (amount < freeAmount) {
        amount = freeAmount
      }
      if (!order) {
        order = await prisma.order.create({
          data: {
            amount,
            receiveAddress,
            claimId: existingClaim?.id || null,
            feeRate,
            expiresAt: new Date(Date.now() + ORDER_EXPIRATION_TIME),
          },
        })
      }
      const { total: totalPrice } = calculatePrice({
        feeRate,
        amount,
        price,
        freeAmount,
      })
      const key = await getKeyForIndex(order.id, true)
      const { inscribingAddress } = await getPaymentAddress(key, amount)
      return {
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        id: order.id,
        receiveAddress,
        paymentAddress: inscribingAddress,
        totalPrice,
      }
    },
  })
