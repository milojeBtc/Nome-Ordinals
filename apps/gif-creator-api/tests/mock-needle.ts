import { vi } from "vitest";

vi.mock("needle", () => ({
    default: vi.fn((method, url, body) => {
        if (url.includes("price")) {
            return {
                status: 200,
                body: {
                    chainFee: 1488,
                    serviceFee: 12694,
                    baseFee: 12000,
                    rareSatsFee: 0,
                    additionalFee: 0,
                    postage: 546,
                    amount: 14182,
                    totalFee: 14182,
                    status: "ok",
                },
            };
        }
        return {
            status: 200,
            body: {
                status: "ok",
                id: "463e6582-d58c-4040-be7c-e5faa72cfa24",
                charge: {
                    id: "123456789",
                },
                files: body.files,
            },
        };
    }),
}));
