<script setup lang="ts">
import { FeeLabels } from '../../constants';

const FeeInfo = {
    [FeeLabels.ECONOMY]: {
        time: "Multiple Days",
    },
    [FeeLabels.NORMAL]: {
        time: "1 hour",
    },
    [FeeLabels.CUSTOM]: {
        time: ''
    }
}

const { modelValue, feeRate, feeRateLabel } = defineProps<{
    modelValue: FeeLabels,
    feeRateLabel: FeeLabels,
    feeRate: number,
}>()


</script>
<template>
    <div class="bg-[#1D1D1D] flex flex-col items-center justify-center rounded-md p-4 cursor-pointer"
        :class="modelValue === feeRateLabel ? 'border-2 border-white bg-[#2C2C2C]' : ''"
        @click="$emit('update:modelValue', feeRateLabel)">
        <b>{{ feeRateLabel }}</b>
        <span class="text-[#5a5a5a] text-center text-sm">{{ feeRate }} sats/vByte</span>
        <p class="mt-4 text-[#5a5a5a] text-center text-sm">{{ FeeInfo[feeRateLabel].time }}</p>
    </div>
</template>