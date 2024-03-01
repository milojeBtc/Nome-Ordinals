import { Documentation } from "express-zod-api"
import { routing } from "../router.js"
import { serverConfig } from "../config.js"

import fs from "node:fs/promises"

const specString = new Documentation({
  routing, // the same routing and config that you use to start the server
  config: serverConfig,
  version: "0.0.1",
  title: "NōMe BRC-20 API",
  serverUrl: process.env.BASE_URL!,
  composition: "inline",
}).getSpecAsYaml()

await fs.mkdir(new URL("../../docs", import.meta.url), {
  recursive: true,
})
await fs.writeFile(
  new URL("../../docs/openapi.yaml", import.meta.url),
  specString,
)

process.exit(0)
