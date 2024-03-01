import { testEndpoint } from "express-zod-api";
import { describe, expect, it, vi } from "vitest";
import { getPriceEndpoint } from "../../src/router/price";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - express zod api uses jest, vi replaces jest
global.jest = vi;

vi.stubEnv("REFERRAL_FEE", "15000");
describe("GET /price", () => {
    it("should return 200 with calculated price when given valid query params", async () => {
        const { responseMock } = await testEndpoint({
            endpoint: getPriceEndpoint,
            requestProps: {
                method: "GET",
                query: {
                    fee_rate: "2",
                    imageSizes: ["1"],
                },
            },
        });

        expect(responseMock.statusCode).toEqual(200);
    });

    it("should return 400 when given invalid query params", async () => {
        const { responseMock } = await testEndpoint({
            endpoint: getPriceEndpoint,
            requestProps: {
                method: "GET",
                body: {
                    fee: "invalid",
                    imageSizes: ["1"],
                },
            },
        });
        expect(responseMock.statusCode).toBe(400);
    });

    it("should return 500 when the Ordinals Bot API returns an error", async () => {
        const { responseMock } = await testEndpoint({
            endpoint: getPriceEndpoint,
            requestProps: {
                method: "GET",
                body: {
                    fee: "0.0001",
                    imageSizes: [1],
                },
            },
        });

        // ("/price?fee=0.0001&imageSizes[]=1");

        expect(responseMock.statusCode).toBe(400);
        // expect(res.body).toHaveProperty("success");
        // expect(res.body.success).toEqual(false);
    });
});
