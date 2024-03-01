import {
  DependsOnMethod,
  Routing,
  defaultEndpointsFactory,
} from "express-zod-api"
import { checkClaimEndpoint } from "./routes/check-claim.js"
import z from "zod"
import { getPriceEndpoint } from "./routes/get-price.js"
import { createOrderEndpoint } from "./routes/create-order.js"
import { getOrderEndpoint } from "./routes/get-order.js"
import { checkProgressEndpoint } from "./routes/check-progress.js"
import { checkWhitelistStatus } from "./routes/check-whitelist-status.js"
import { analyticsEndpoint } from "./routes/analytics.js"

export const routing: Routing = {
  "": defaultEndpointsFactory.build({
    method: "get",
    shortDescription: "Server Status",
    description: "Check if the server is alive",
    handler: async () => {
      return {
        message: "I am alive! or am I?",
      }
    },
    input: z.object({}),
    output: z.object({ message: z.string() }),
  }),
  "check-claim": checkClaimEndpoint,
  price: getPriceEndpoint,
  orders: {
    "": new DependsOnMethod({
      post: createOrderEndpoint,
    }),
    ":id": getOrderEndpoint,
  },
  progress: checkProgressEndpoint,
  whitelist: {
    status: checkWhitelistStatus,
  },
  analytics: {
    ":key": analyticsEndpoint,
  },
}
