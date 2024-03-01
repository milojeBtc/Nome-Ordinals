import { useQuery } from "@tanstack/vue-query";
import { getPriceApi } from "../get-price";
import { Ref } from "vue";

export function usePriceQuery({
  frameCount,
  feeRate,
  imageSizes,
  mintQuantity,
  selectedRarity,
}: {
  frameCount: Ref<number>;
  feeRate: Ref<number>;
  imageSizes: Ref<number[]>;
  mintQuantity: Ref<number>;
  selectedRarity: Ref<string>;
}) {
  return useQuery({
    queryKey: [
      "price",
      frameCount,
      imageSizes,
      selectedRarity,
      mintQuantity,
      feeRate,
    ],
    queryFn: async () => {
      const data = await getPriceApi({
        count: mintQuantity.value,
        fee: feeRate.value,
        imageSizes: imageSizes.value,
        rareSats: selectedRarity.value,
      });
      return data.data.totalFee / 100_000_000;
    },
    enabled: () =>
      Boolean(
        frameCount.value &&
          feeRate.value &&
          mintQuantity.value &&
          imageSizes.value.length &&
          selectedRarity.value
      ),
  });
}
