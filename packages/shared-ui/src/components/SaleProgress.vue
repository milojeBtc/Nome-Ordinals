<script setup lang="ts">
import ProgressBar from './ui/ProgressBar.vue';
import { computed } from 'vue';
import { formatNumber } from '../util/formatNumber';
import { useMintProgress } from '../api/queries/mint-progress';

const progress = useMintProgress()

const progressFormatted = computed(() => formatNumber(progress.value))

const percentage = computed(() => progress.value / 50_000_000 * 100)
</script>

<template>
    <div class="p-4 bg-[#252525] w-full rounded-lg text-sm sm:text-base">
        <div class="pb-4 border-b border-[#6b6b6b] border-solid">
            <div class="flex justify-between">
                <div class="flex flex-col gap-2">
                    <p>Total Supply – 100M</p>
                    <p>Public mint – 50M</p>
                    <p>Minimum mint – 5K</p>
                </div>
                <div class="flex flex-col gap-2">
                    <p>Price – 0.00000013 BTC</p>
                    <p>WL price – 0.0000001 BTC</p>
                    <p>Maximum mint – 1M</p>
                </div>
            </div>
        </div>
        <div class="pt-4">
            <div class="flex justify-between mb-4">
                <div class="flex gap-x-2 ">
                    <img class="w-4" src="../assets/images/lightning-bolt-icon.png" alt="lightning bolt icon"
                        role="presentation">
                    Progress
                </div>
                <div>
                    {{ progressFormatted }} / 50,000,000
                </div>
            </div>
            <ProgressBar :percent="percentage" />

        </div>
    </div>
</template>