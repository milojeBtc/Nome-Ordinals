<script setup lang="ts">
import { OrderingState } from '../../constants/inscriptions';

const textByStatus = {
    [OrderingState.None]: 'Leather',
    [OrderingState.RequestingWalletAddress]: 'Requesting Addresses...',
    [OrderingState.WaitingForCreation]: 'Creating order...',
    [OrderingState.WaitingForPayment]: 'Waiting for payment...',
}

const { orderingState } = defineProps<{ orderingState: OrderingState }>();
defineEmits<{
    inscribe: [event: Event]
}>()
</script>

<template>
    <button @click="$emit('inscribe', $event)" :disabled="orderingState !== OrderingState.None"
        class="flex flex-row items-center gap-6 mx-0 min-w-[10rem] py-2 px-4 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black cursor-pointer z-10 rounded-xl disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100">
        <img src="../../assets/images/leather-icon-9a4d5194.png" className="h-8" />{{ textByStatus[orderingState] }}
    </button>
</template>