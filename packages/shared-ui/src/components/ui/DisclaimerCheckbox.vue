<script setup lang="ts">
const props = defineProps({
    text: String,
    modelValue: Boolean,
})
defineEmits([
    'update:modelValue',
])
</script>
<template>
    <label class="flex gap-x-6 items-center">
        <img v-if="!props.modelValue" class="w-6 h-6" src="../../assets/images/green-check-box-unchecked.png" alt=""
            role="presentation">
        <img v-else class="w-6 h-6" src="../../assets/images/green-check-box-checked.png" alt="" role="presentation">
        <input @change="$emit('update:modelValue', !props.modelValue)" :checked="props.modelValue" class="w-6" hidden
            type="checkbox">
        {{ props.text }}
    </label>
</template>