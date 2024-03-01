import { defaultEndpointsFactory, ez } from "express-zod-api"
import createHttpError from "http-errors"
import { z } from "zod"
import { generateReport } from "../util/generate-report.js"

export const analyticsEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    key: z.string(),
  }),
  output: z.object({
    totals: z.object({
      price: z.number(),
      orders: z.number(),
      feeRate: z.number(),
      amount: z.number(),
    }),
    orders: z.array(
      z.object({
        id: z.number(),
        address: z.string(),
        price: z.number(),
        amount: z.number(),
        feeRate: z.number(),
        createdAt: ez.dateOut(),
      }),
    ),
  }),
  shortDescription: "Get analytics",
  handler: async ({ input }) => {
    if (input.key !== process.env.ANALYTICS_SECRET) {
      throw createHttpError(401, "Invalid key")
    }

    return generateReport()
  },
})
