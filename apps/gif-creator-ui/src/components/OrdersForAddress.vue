<script setup lang="ts">
import { computed, ref } from 'vue'
import { validate as validateBitcoinAddress, getAddressInfo, AddressType } from "bitcoin-address-validation"
import { useQuery } from '@tanstack/vue-query'
import { getOrdersApi } from '../api/get-orders.ts';

const walletAddress = ref("");

const isValidAddress = computed(() => {
    return (
        validateBitcoinAddress(walletAddress.value) &&
        getAddressInfo(walletAddress.value).type === AddressType.p2tr
    );
});
const { data: userOrders, isSuccess } = useQuery({
    queryKey: ["orders", walletAddress],
    queryFn: async () => {
        const { data } = await getOrdersApi(walletAddress.value);

        return data.data.filter((item) => item.status !== "UNPAID");
    },
    enabled: () => isValidAddress.value,
});

const hasNoOrders = computed(() => {
    return isSuccess.value && userOrders.value?.length === 0;
});
</script>
<template>
    <div class="flex flex-col md:flex-row w-full gap-x-12 mt-32 sm:mt-8 max-w-md">
        <div class="basis-full flex flex-col gap-5">
            <div class="text-lg sm:text-base">Check the order</div>
            <input type="text" v-model="walletAddress" placeholder="Wallet address"
                class="border border-solid bg-transparent h-10 rounded-xl p-3 text-white w-full outline-none" :class="!walletAddress
                    ? 'border-white'
                    : isValidAddress
                        ? 'border-green-400'
                        : 'border-red-400'
                    " />
            <div v-if="hasNoOrders">
                You don't have an order
            </div>


            <div v-for="order in userOrders" :key="order.id" class="flex justify-between gap-x-2">
                <span class="basis-4/12">Order status</span>
                <span class="basis-1/12 text-center">-</span>
                <span class="capitalize basis-3/12">{{
                    order.status === "READY" ? "inscribed" : "inscribing"
                }}</span>
                <a :href="order.payment_tx_id! &&
                    `https://mempool.space/tx/${order.payment_tx_id}`
                    " class="underline basis-4/12" target="_blank">
                    {{ order.payment_tx_id ? "Mempool link" : "Unpaid" }}
                </a>
            </div>
        </div>
    </div>
</template>