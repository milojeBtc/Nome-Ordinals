<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { CompressAble } from '../constants/inscriptions';
import { buildGif } from '../util/buildGIF';
import Frame from './Frame.vue';
import { RangeInput } from '@repo/shared-ui';
const framesContainerRef = ref<HTMLElement | null>(null);
const frameCompressionState = ref<boolean[]>([]);
const files = ref<CompressAble[]>([])
const quality = ref(100);
const emit = defineEmits<{
  generated: [data: [gifSrc: string, frames: CompressAble[]]]
  progress: [progress: number]
}>()

const isCompilingGIF = ref(false)


const isCompressing = computed(() => {
  return frameCompressionState.value.some((item) => item);
});
async function getFiles(e: Event) {
  const allAreImages = Array.from((e.target as HTMLInputElement).files!).every(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type)
  );

  if (!allAreImages) {
    alert("Please select only images");
    return;
  }
  const availableSlots = 10 - files.value.length;
  if (availableSlots <= 0) {
    return;
  }

  emit('generated', ['', files.value]);
  const { files: newFilesList } = e.target as HTMLInputElement;
  const newFiles = Array.from(newFilesList!).slice(0, availableSlots);
  if (!newFiles.length) {
    e.preventDefault();
    return;
  }
  let imageFiles = newFiles.map((file) => {
    return {
      img: URL.createObjectURL(file),
      original: file,
      compressed: file,
      duration: 0.5,
    };
  });
  // show original images initially
  files.value = [...files.value, ...imageFiles];
  // compress images in the meanwhile
  // after compression is done, replace original images with compressed ones
  imageFiles.forEach((file) => {
    URL.revokeObjectURL(file.img);
  });
  files.value = [...files.value.slice(0, -imageFiles.length), ...imageFiles];
}
function duplicateFile(item: CompressAble) {
  if (files.value.length >= 10) {
    return;
  }
  emit('generated', ['', files.value]);

  files.value = files.value.concat([{ ...item }]);
}

function removeFile(item: CompressAble) {
  if (!item) {
    return;
  }
  emit('generated', ['', files.value]);

  files.value = files.value.filter((file) => file !== item);
}

function handleFileCompressed(index: number, compressed: File) {
  frameCompressionState.value[index] = false;
  files.value[index].compressed = compressed;
}
async function generateGIF() {
  if (files.value.length == 0) {
    return;
  }

  isCompilingGIF.value = true;
  emit('progress', 0)
  const gifBlob = await buildGif({
    frames: files.value.map((item) => ({
      imageFile: item.compressed,
      duration: Number(item.duration) || 0.000001,
    })),
    onProgress: (progress) => {
      emit('progress', Math.ceil(progress * 100));
    },
  });
  emit('generated', [URL.createObjectURL(gifBlob), files.value]);

  isCompilingGIF.value = false;
}

watch([files, quality], () => {
  emit('generated', ['', files.value]);
});
</script>

<template>
  <div class="flex justify-start w-full sm:w-1/2">
    <label
      class="min-w-[13.3rem] py-2 px-0 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black p-1 cursor-pointer z-10 rounded-xl mb-3">
      UPLOAD FRAMES
      <input type="file" accept="image/webp" multiple hidden v-on:change="getFiles" />
    </label>
  </div>

  <div>
    <div class="w-full flex flex-wrap gap-4 mt-12 mb-12" ref="framesContainerRef">
      <!-- <div class="w-full sm:w-1/2 pr-4 pl-4 md:w-1/3 pr-4 pl-4 lg:w-1/4 pr-4 pl-4 "> -->
      <Frame v-for="(item, index) in files" :key="'frame/' + item.original.name + index" :index="index"
        :original="item.original" v-model:duration="item.duration" @on-plus-click="duplicateFile(item)"
        @on-x-click="removeFile(item)" @on-compressed="handleFileCompressed(index, $event)"
        @on-compressing="frameCompressionState[index] = $event" :compression-rate="quality" />
      <!-- </div> -->
      <Frame v-if="files.length == 0" :index="0" :duration="0.5" />
    </div>
  </div>
  <div class="w-full flex sm:flex-row flex-col-reverse sm:flex-wrap gap-16 sm:gap-0">
    <div class="w-full p-0 basis-full sm:basis-1/2">
      <button type="button" @click="generateGIF" :disabled="isCompilingGIF || isCompressing"
        class="mx-0 mb-16 sm:mb-24 min-w-[13.3rem] py-2 px-0 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black p-1 cursor-pointer z-10 rounded-xl disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100">
        <span v-if="isCompilingGIF"> Generating GIF... </span>
        <span v-else-if="isCompressing"> Compressing... </span>
        <span v-else> GENERATE GIF </span>
      </button>
    </div>
    <div class="flex-1 px-0 basis-full sm:basis-1/2 mt-4">
      <div class="flex px-0 sm:pl-4 flex-col justify-center sm:justify-start sm:w-[40%] sm:min-w-[16rem]">
        <RangeInput v-model="quality" :min="1" :max="100" :step="1" />
        <label class="mt-[1.2rem] text-center w-full text-2xl sm:text-base">
          .webp file quality – {{ quality }}%
        </label>
      </div>
    </div>
  </div>
</template>