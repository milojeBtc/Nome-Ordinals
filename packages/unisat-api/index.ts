import { z } from "zod";

export const brc20InfoResponse = z.object({
  code: z.number(),
  msg: z.string(),
  data: z.object({
    ticker: z.string(),
    overallBalance: z.string(),
    transferableBalance: z.string(),
    availableBalance: z.string(),
    availableBalanceSafe: z.string(),
    availableBalanceUnSafe: z.string(),
    transferableCount: z.number(),
    transferableInscriptions: z.array(z.unknown()),
    historyCount: z.number(),
    historyInscriptions: z.array(
      z.object({
        data: z.object({
          op: z.string(),
          tick: z.string(),
          lim: z.string(),
          amt: z.string(),
          decimal: z.string(),
        }),
        inscriptionNumber: z.number(),
        inscriptionId: z.string(),
        satoshi: z.number(),
        confirmations: z.number(),
      })
    ),
  }),
});

export type brc20InfoResponse = z.infer<typeof brc20InfoResponse>;

export async function getBRC20Balance({
  address,
  ticker,
  apiKey,
}: {
  address: string;
  ticker: string;
  apiKey: string;
}): Promise<brc20InfoResponse> {
  const res = await fetch(
    `https://open-api.unisat.io/v1/indexer/address/${address}/brc20/${ticker}/info`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
    }
  );
  return await res.json();
}
