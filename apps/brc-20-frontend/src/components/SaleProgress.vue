<script setup lang="ts">
import { ProgressBar, formatNumber } from '@repo/shared-ui';
import { computed } from 'vue';

import { useMintProgress } from '../api/queries/mint-progress';
import { useBTCPrice } from '../api/queries/coin-cap-btc-price';

const progress = useMintProgress()

const progressFormatted = computed(() => formatNumber(progress.value))

const percentage = computed(() => progress.value / 5_000_000 * 100)
const { data: usdPrice } = useBTCPrice();

</script>

<template>
  <div class="p-4 py-8 bg-[#252525] w-full rounded-lg text-sm sm:text-xl">
    <div class="pb-8 border-b border-[#6b6b6b] border-solid">
      <div class="flex justify-between">
        <div class="flex flex-col gap-2">
          <p>Total Supply – 100M</p>
          <p>First round – 5M</p>
          <p>Price – 0.00000013 BTC</p>
        </div>
        <div class="flex flex-col gap-2">
          <p>Maximum mint – 1M</p>
          <p>Minimum mint – 5K</p>
          <p v-if="usdPrice">Price – ${{ (0.00000013 * usdPrice).toFixed(3) }}</p>
        </div>
      </div>
    </div>
    <div class="pt-8">
      <div class="flex justify-between mb-4">
        <div class="flex gap-x-2 ">
          <img class="w-4" src="../assets/images/lightning-bolt-icon.png" alt="lightning bolt icon" role="presentation">
          Progress
        </div>
        <div class="flex gap-x-2">
          {{ progressFormatted }} / 5,000,000&nbsp;
        </div>
      </div>
      <ProgressBar :percent="percentage" />

    </div>
  </div>
</template>
