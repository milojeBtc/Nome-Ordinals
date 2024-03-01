import { createServer } from "express-zod-api"

import { routing } from "./router.js"
import { serverConfig } from "./config.js"
import { updateProgress } from "./scheduler/watch-buys/updateProgress.js"

const { app, logger } = await createServer(serverConfig, routing)

// update progress when app starts
updateProgress()

export { app, logger }
