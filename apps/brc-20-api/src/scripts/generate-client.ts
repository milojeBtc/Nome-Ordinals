import { writeFile } from "node:fs/promises"
import { Integration } from "express-zod-api"
import { routing } from "../router.js"

await writeFile(
  new URL("../../../brc-20-frontend/src/api/generated.ts", import.meta.url),
  new Integration({
    routing,
    variant: "client",
    optionalPropStyle: { withQuestionMark: true, withUndefined: true },
  }).print({ removeComments: true, newLine: 1, omitTrailingSemicolon: true }),
  "utf-8",
)
// weird I have to do this but meh
process.exit(0)
