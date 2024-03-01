<script setup lang="ts">
const {
    isLoading,
    imgSrc,
    progress,
} = defineProps<{
    isLoading: boolean
    imgSrc: string
    progress?: number
}>()
</script>
<template>
    <div :class="isLoading ? 'cursor-wait' : ''"
        class="p-6 border border-opacity-20 border-white h-[30rem] w-full flex justify-center items-center mt-8">
        <img v-if="imgSrc" :src="imgSrc" alt="" class="w-full h-full object-contain" />
        <span v-if="isLoading" class="text-4xl">{{ progress }}%</span>
    </div>
</template>