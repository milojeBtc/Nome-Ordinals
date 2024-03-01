import { DependsOnMethod, Routing, ServeStatic } from "express-zod-api";
import { getOrdersEndpoint } from "./orders";
import { getPriceEndpoint } from "./price";
import { createOrderEndpoint } from "./create-order";
import { updateOrderWebhook } from "./update-order-webhook";
import path from "path";

export const routing: Routing = {
    orders: {
        "": new DependsOnMethod({
            get: getOrdersEndpoint,
            post: createOrderEndpoint,
        }),
        ":token": updateOrderWebhook,
    },
    price: getPriceEndpoint,
    docs: new ServeStatic(path.resolve(__dirname, "../../docs")),
};
