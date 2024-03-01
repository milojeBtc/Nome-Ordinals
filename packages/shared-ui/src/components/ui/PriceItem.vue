<script setup lang="ts">
const { label, value } = defineProps({
    label: String,
    value: String
})
</script>
<template>
    <div class="flex gap-x-4">
        <span class="w-56">
            {{ label }}
        </span>
        <span>
            {{ value }}
        </span>
    </div>
</template>