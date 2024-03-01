import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { prisma } from "../prisma/client.js"

import { validBTCAddress } from "../util/zod-extras.js"

import { isWhitelistOpen } from "../util/isWhiteListOpen.js"
import { PRICE, WL_PRICE } from "../constants.js"
export const checkClaimEndpoint = defaultEndpointsFactory.build({
  shortDescription: "Check a claim",
  description: "Checks if a claim is valid and returns the type",
  method: "get",
  input: z.object({
    address: validBTCAddress,
  }),
  output: z.object({
    freeAmount: z.number(),
    isWhitelistOpen: z.boolean(),
    price: z.number(),
    isWhitelisted: z.boolean(),
  }),
  handler: async ({ input }) => {
    const { address } = input
    const claim = await prisma.claim.findFirst({
      where: {
        ordinalAddress: address,
      },
    })

    const wlOpen = await isWhitelistOpen()
    let freeAmount = 0
    let price = PRICE

    if (claim && claim.freeAmount) {
      freeAmount = claim.freeAmount - claim.claimedAmount
    }
    if (wlOpen) {
      price = WL_PRICE
    }

    return {
      freeAmount,
      isWhitelistOpen: wlOpen,
      price,
      isWhitelisted: !!claim,
    }
  },
})
