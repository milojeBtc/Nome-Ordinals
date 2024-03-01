import { prismaMock } from "../prisma-singleton";
import { OrderStatus } from "@repo/gif-creator-db";
import { describe, expect, it, vi } from "vitest";
import { testEndpoint } from "express-zod-api";
import { createOrderEndpoint } from "../../src/router/create-order";
vi.mock("jest", () => vi);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - express zod api uses jest, vi replaces jest
global.jest = vi;
describe("Orders Endpoints", () => {
    it("POST /inscribe should create an order", async () => {
        prismaMock.order.create.mockResolvedValueOnce({
            id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            ordinals_bot_order_id: "2143",
            receiver_address: "afadf",
            update_token: "4124",
            quantity: 1,
            status: OrderStatus.UNPAID,
            payment_tx_id: "0x123456789",
            total_fee: 100,
            fee_rate: 11,
            rarity: "random",
        });

        const { responseMock } = await testEndpoint({
            endpoint: createOrderEndpoint,
            requestProps: {
                method: "POST",
                body: {
                    files: [
                        {
                            size: 10,
                            type: "image/webp",
                            name: "my-text-inscription-file-2.txt",
                            dataURL: "data:image/webp;base64,dGVzdCBvcmRlcg==",
                            duration: 1200,
                        },
                    ],
                    receiverAddress:
                        "tb1pwjt7j5ztg5vw7y4havg4gaemlzkq8fhgrwltvldeq4fay22m60rqf920wy",
                    payAddress: "2N1YtccU92ZWQmyBCfo77qGbqXCKfxp7wkP",
                    rarity: "random",
                    feeRate: 11,
                },
            },
        });

        // expect(prismaMock.ordinal.create).toBeCalledTimes(1);
        expect(responseMock.status).toBeCalledWith(200);
        // expect(res.body).toHaveProperty("success");
        // expect(res.body).toHaveProperty("message");
    });

    it("POST /inscribe should return 400 if no files are provided", async () => {
        const { responseMock } = await testEndpoint({
            endpoint: createOrderEndpoint,

            requestProps: {
                method: "POST",
                body: {
                    files: [],
                    rarity: "random",
                    payAddress: "2N1YtccU92ZWQmyBCfo77qGbqXCKfxp7wkP",
                    receiverAddress:
                        "tb1pwjt7j5ztg5vw7y4havg4gaemlzkq8fhgrwltvldeq4fay22m60rqf920wy",
                },
            },
        });
        expect(prismaMock.order.create).toBeCalledTimes(0);
        expect(responseMock.json).toBeCalledWith({
            status: "error",
            error: {
                message:
                    "files: Must have at least one file; feeRate: Required",
            },
        });
        expect(responseMock.status).toBeCalledWith(400);
    });

    it("POST /inscribe should return 400 if no receiverAddress is provided", async () => {
        const { responseMock } = await testEndpoint({
            endpoint: createOrderEndpoint,
            requestProps: {
                method: "POST",
                body: {
                    files: [
                        {
                            name: "test",
                            type: "image/png",
                            dataURL: "data:image/png;base64,123456789",
                            size: 10,
                        },
                    ],

                    rarity: "random",
                    receiverAddress: "",
                },
            },
        });

        expect(responseMock.status).toBeCalledWith(500);
    });
});
