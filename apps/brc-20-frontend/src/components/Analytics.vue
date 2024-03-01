<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { useRoute } from 'vue-router'
import { client } from '../api/client';
import Header from './shared/Header.vue';
import Footer from './shared/Footer.vue';
import { computed } from 'vue';
import { formatNumber } from '@repo/shared-ui';

const route = useRoute()

const {
    data,
    isError
} = useQuery({
    queryKey: ['analytics', route.params.key],
    queryFn: () => {
        return client.provide('get', '/analytics/:key', { key: route.params.key as string })
    }
})

const orders = computed(() => data.value?.status === 'success' && data.value.data.orders)
const totals = computed(() => data.value?.status === 'success' && data.value.data.totals)
</script>

<template>
    <main class="p-6">

        <Header />
        <div v-if="isError" class="w-full h-full">
            <p>Something went wrong</p>
        </div>

        <table v-else class="w-full text-gray-300 divide-y divide-gray-300 max-h-96 overflow-auto">
            <thead>
                <tr class="text-left text-xs font-medium uppercase tracking-wider">
                    <th scope="col" class="px-6 py-3">
                        Address</th>
                    <th scope="col" class="px-6 py-3">
                        Amount (tokens)</th>
                    <th scope="col" class="px-6 py-3">
                        Price (sats)</th>
                    <th scope="col" class="px-6 py-3">
                        Fee Rate (sats/vByte)</th>
                    <th scope="col" class="px-6 py-3">
                        Date</th>
                </tr>
            </thead>
            <tbody v-if="orders">
                <tr v-for="transaction in orders">
                    <td class="px-6 py-4 whitespace-nowrap">{{ transaction.address }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ formatNumber(transaction.amount) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ formatNumber(transaction.price) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ transaction.feeRate }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ transaction.createdAt }}</td>
                </tr>

            </tbody>
            <tfoot v-if="totals">
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        {{ formatNumber(totals.orders) }} (total)
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        {{ formatNumber(totals.amount) }} (total)
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        {{ formatNumber(totals.price) }} (total)
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        {{ totals.feeRate }} (average)
                    </td>
                </tr>
            </tfoot>
        </table>

        <Footer />
    </main>
</template>