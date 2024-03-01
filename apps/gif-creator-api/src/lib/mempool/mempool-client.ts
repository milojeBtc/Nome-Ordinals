import mempoolJS from "@mempool/mempool.js";
export const mempool = mempoolJS({
    hostname: process.env.MEMPOOL_BASE_URL?.replace("https://", "").replace(
        "/api",
        ""
    ),
});
