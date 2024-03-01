import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { isWhitelistOpen } from "../util/isWhiteListOpen.js"

export const checkWhitelistStatus = defaultEndpointsFactory.build({
  method: "get",
  shortDescription: "Check whitelist status",
  description: "Check if the whitelist is active",
  input: z.object({}),
  output: z.object({
    open: z.boolean(),
  }),
  handler: async () => {
    const open = await isWhitelistOpen()
    return { open }
  },
})
