import { createConfig } from "express-zod-api"
import type { Logger } from "winston"

export const serverConfig = createConfig({
  server: {
    listen: process.env.PORT || 8090, // port, UNIX socket or options
  },
  cors: true,
  logger: { level: "debug", color: true },
  startupLogo: process.env.NODE_ENV === "production",
})

// Setting the type of the logger used
declare module "express-zod-api" {
  interface LoggerOverrides extends Logger {}
}
