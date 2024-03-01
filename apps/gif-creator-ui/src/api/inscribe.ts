// {
//     name: string;
//     type: string;
//     dataURL: string;
//     size: number;
// }
import { api } from "./api-instance.ts";

interface FileData {
  size: number;
  type: string;
  name: string;
  dataURL: string;
  duration: number;
}

interface InscribeParams {
  files: FileData[];
  rarity: "block78" | "pizza" | "uncommon" | "black" | "vintage" | "random";
  receiverAddress: string;
  payAddress: string;
  feeRate: number;
}

interface Charge {
  amount: number;
  address: string;
}

interface OrderData {
  id: number;
  payment_details: Charge;
}

export const inscribeApi = async ({
  files,
  rarity,
  receiverAddress,
  feeRate,
  payAddress,
}: InscribeParams): Promise<{
  message: string;
  data: OrderData;
  success: boolean;
}> => {
  const response = await api.post("/orders", {
    files,
    rarity,
    receiverAddress,
    feeRate,
    payAddress,
  });
  return response.data;
};
