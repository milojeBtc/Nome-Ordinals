<script setup lang="ts">

const {
    framesCount,
    mintQuantity,
    totalFee,
    usdPrice
} = defineProps<{
    framesCount: number;
    mintQuantity: number
    usdPrice?: number;
    totalFee?: number;
}>()

</script>
<template>
    <!-- v-if'd -->
    <!-- <div :class="gifSrc && files.length > 0 ? 'block' : 'hidden'"> -->
    <div>
        <div class="flex mt-3 justify-between text-gray-500">
            <div>Frames</div>
            <div>{{ framesCount }}</div>
        </div>
        <div class="flex justify-between text-gray-500">
            <div>Total items</div>
            <div>{{ framesCount + mintQuantity }}</div>
        </div>
        <div class="flex justify-between text-gray-500">
            <div>Final USD price</div>
            <div v-show="usdPrice && totalFee">
                ${{ ((usdPrice || 0) * totalFee!).toFixed(2) }}
            </div>
        </div>
        <div class="flex justify-between text-gray-500">
            <div>Final BTC price</div>
            <div>{{ totalFee && totalFee.toFixed(8) }}</div>
        </div>
    </div>
</template>