import { PrismaClient } from "@repo/gif-creator-db";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";

import prisma from "../src/lib/prisma-client";
import { beforeEach, vi } from "vitest";

vi.mock("../src/lib/prisma-client", () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
    mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
