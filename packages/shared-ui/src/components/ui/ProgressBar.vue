<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    percent: { type: Number, default: 0 },
});

const width = computed(() => `${props.percent}%`);
</script>


<template>
    <div class="flex items-center bg-[#848484] rounded overflow-hidden">
        <div class="h-3 bg-white rounded-l rounded-r" :style="{ width }"></div>
    </div>
</template>
