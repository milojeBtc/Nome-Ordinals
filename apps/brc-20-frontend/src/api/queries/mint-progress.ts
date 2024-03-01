import { useQuery } from "@tanstack/vue-query";
import { client } from "../client";
import { computed } from "vue";

export const useMintProgress = () => {
  const { data } = useQuery({
    queryKey: ["mint progress"],
    queryFn: async () => {
      return client.provide("get", "/progress", {});
    },
  });
  return computed(() => {
    if (data.value?.status === "success" && data.value?.data?.progress) {
      return data.value.data.progress;
    } else {
      return 0;
    }
  });
};
