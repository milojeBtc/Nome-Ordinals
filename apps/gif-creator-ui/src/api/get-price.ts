import { api } from "./api-instance.ts";

type priceResponse = {
  totalFee: number;
};
export const getPriceApi = async ({
  imageSizes,
  fee,
  count = 1,
  rareSats = "random",
}: {
  imageSizes: number[];
  fee: number;
  count: number;
  rareSats: string;
}): Promise<{ message: string; data: priceResponse; success: boolean }> => {
  const response = await api.get("/price", {
    params: {
      imageSizes,
      fee_rate: fee,
      count,
      rareSats,
    },
  });
  return response.data;
};
