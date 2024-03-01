<script setup lang="ts">
import { ref } from 'vue';

const { modelValue } = defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
}>()
const emit = defineEmits<{
    'update:modelValue': [value: number]
}>()

const innerValue = ref(String(modelValue))
const handleChange = (e: Event) => {
    innerValue.value = (e.target as HTMLInputElement).value
    emit('update:modelValue', Number(innerValue.value))
}

</script>
<template>
    <input type="range" :value="innerValue" @change="handleChange" :min="min" :max="max" :step="step" />
</template>
<style>
input[type="range"] {
    @apply appearance-none flex items-center h-px w-full m-0 p-0 border-0;
}

input[type="range"]::-webkit-slider-thumb {
    @apply appearance-none bg-white h-8 w-4 sm:h-6 sm:w-3 rounded-lg;
}
</style>