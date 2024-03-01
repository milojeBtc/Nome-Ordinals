import { createServer } from "express-zod-api";
import { routing } from "./router/router";
import { config as serverConfig } from "./server-config";
import { toadScheduler } from "./scheduler/toad";

const { app, logger } = createServer(serverConfig, routing);
export { app, logger };
app.on("close", () => {
    logger.info("Closing server");
    toadScheduler.stop();
});
