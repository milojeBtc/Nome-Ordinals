import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { getProgress } from "../scheduler/watch-buys/updateProgress.js"

export const checkProgressEndpoint = defaultEndpointsFactory.build({
  method: "get",
  shortDescription: "Check sale progress",
  description: "How much tokens have been sold",
  input: z.object({}),
  output: z.object({
    progress: z.number(),
  }),
  handler: async () => {
    const progress = await getProgress()
    return { progress }
  },
})
