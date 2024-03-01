<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from "vue";
import Modal from "./Modal.vue";
import { formatBytes } from "../util/formatBytes.ts";
import imageCompression from "browser-image-compression";
const emit = defineEmits([
  "update:duration",
  "on-plus-click",
  "on-x-click",
  "on-compressed",
  "on-compressing",
]);

const props = defineProps({
  index: Number,
  duration: Number,
  original: File,
  compressionRate: Number,
});

const compressionProgress = ref(0);
const isCompressing = ref(false);
const compressed = ref<File | null>(null);
const isPreviewOpen = ref(false);

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      resolve(image);
    };
  });
};

const imageURL = computed<string | null>((oldValue) => {
  if (oldValue) {
    URL.revokeObjectURL(oldValue);
  }
  if (compressed.value) {
    return URL.createObjectURL(compressed.value);
  }
  if (props.original) {
    return URL.createObjectURL(props.original);
  }
  return null;
});

const isPixelated = ref(false);

watch(
  () => props.compressionRate,
  async (_old, _new, cleanUp) => {
    if (!props.original) {
      return;
    }

    if (props.original.size < 1024) {
      isPixelated.value = true;
      compressed.value = props.original;
      return;
    }
    emit("on-compressing", true);
    isCompressing.value = true;
    const image = await loadImage(props.original);
    const width = image.width;
    const height = image.height;
    const largestDimension = Math.max(width, height);
    URL.revokeObjectURL(image.src);
    const compressionSignal = new AbortController();
    let maxWidthOrHeight = Math.round(
      largestDimension * (props.compressionRate! / 100)
    );
    maxWidthOrHeight = Math.max(maxWidthOrHeight, 50);
    compressed.value = await imageCompression(props.original, {
      maxWidthOrHeight,
      maxSizeMB:
        ((props.original.size / 1000000) * props.compressionRate!) / 100,
      fileType: "image/webp",
      signal: compressionSignal.signal,
      onProgress(progress) {
        compressionProgress.value = progress;
      },
    });

    isPixelated.value = maxWidthOrHeight <= 50;

    emit("on-compressed", compressed.value);

    isCompressing.value = false;

    cleanUp(() => {
      compressionSignal.abort();
      emit("on-compressing", false);
    });
  },
  { immediate: true }
);

onUnmounted(() => {
  emit("on-compressing", false);
  if (imageURL.value) {
    URL.revokeObjectURL(imageURL.value);
  }
});

const changePreviewStatus = (status: boolean) => {
  isPreviewOpen.value = status;
};
const openPreview = () => {
  if (!imageURL) {
    return;
  }
  changePreviewStatus(true);
};
</script>

<template>
  <Modal :is-open="isPreviewOpen" @on-visibility-change="changePreviewStatus">
    <img :src="imageURL!" class="max-w-full max-h-screen"
      :style="{ imageRendering: isPixelated ? 'pixelated' : 'initial' }" />
  </Modal>

  <div class="pl-0 p-8 relative">
    <span class="absolute top-1 right-2 font-thin text-xl cursor-pointer" @click="$emit('on-x-click')">
      x
    </span>
    <div class="w-72">
      <div class="h-72 relative text-lg bg-black border border-solid border-white border-opacity-20">
        <div v-if="isCompressing"
          class="w-full h-full absolute bg-black bg-opacity-70 flex items-center justify-center text-2xl z-10 cursor-wait">
          {{ compressionProgress }}%
        </div>

        <span @click="imageURL && $emit('on-plus-click')"
          class="text-2xl absolute top-4 right-4 cursor-pointer bg-[#1f1f1f] rounded-full w-6 h-6 flex justify-center items-center leading-[0.9]">
          +
        </span>
        <img v-if="imageURL" @click="openPreview" class="w-full h-full bg-cover object-contain cursor-zoom-in" :style="{
          imageRendering: isPixelated ? 'pixelated' : 'initial',
        }" :src="imageURL" />
      </div>
      <div class="rounded-b-lg flex py-2 px-4 justify-between items-center bg-[#1f1f1f] w-full">
        <span class="text-2xl">{{ index! + 1 }}</span>
        <div class="flex items-center">
          <input :value="duration" :disabled="!imageURL" @input="
            $emit(
              'update:duration',
              ($event.target as HTMLInputElement).value
            )
            " type="number" step="0.1"
            class="text-lg font-bold bg-transparent text-white border-0 outline-none mr-2 text-right w-16" min="0" />
          <span> sec. </span>
        </div>
      </div>
    </div>
    <div v-if="original && compressed" class="text-white text-opacity-40 text-base py-4 text-center">
      Before - {{ original && formatBytes(original.size, 0) }} | After -
      {{ compressed && formatBytes(compressed.size, 0) }}
    </div>
  </div>
</template>
