import { getBRC20Balance } from "@repo/unisat-api";

export async function checkUserBalance({ address }: { address: string }) {
    return getBRC20Balance({
        address,
        ticker: process.env.NOME_BRC20_TICKER!,
        apiKey: process.env.UNISAT_API_KEY!,
    });
}
