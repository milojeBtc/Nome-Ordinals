import { useQuery } from "@tanstack/vue-query";

export function useBTCPrice() {
  return useQuery({
    queryKey: ["coinCap"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const response = await fetch("https://api.coincap.io/v2/rates/bitcoin", {
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      return response.data.rateUsd as number;
    },
  });
}
