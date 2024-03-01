import { Documentation } from "express-zod-api";
import { routing } from "../router/router";
import { config } from "../server-config";
import path from "path";
import fs from "fs";

const specString = new Documentation({
    routing, // the same routing and config that you use to start the server
    config,
    version: "0.0.1",
    title: "GIF Creator API",
    serverUrl: process.env.BASE_URL!,
    composition: "inline",
}).getSpecAsYaml();

fs.mkdirSync(path.resolve(__dirname, "../../docs"), { recursive: true });
fs.writeFileSync(
    path.resolve(__dirname, "../../docs/openapi.yaml"),
    specString,
);
