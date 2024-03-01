<script setup lang="ts">
import { ref } from 'vue';

const volume = ref(40);
const isMuted = ref(true);

function toggleVideoSound() {
  isMuted.value = !isMuted.value;
}

function handleVolumeChange(e: Event) {
  volume.value = Number((e.target as HTMLInputElement).value);
}

</script>


<template>
  <div class="relative h-screen w-screen">
    <video src="/brc-20-intro.mp4" playsinline loop id="video" autoplay preload="auto" :muted="isMuted"
      :volume="volume / 100" class="min-w-full h-1/3 sm:min-h-full object-cover fixed z-0"></video>

    <div
      class="h-2/3 sm:h-20 fixed bg-black items-center bottom-0 w-full flex justify-between p-3 text-white text-xl px-3 sm:px-12 flex-wrap flex-col sm:flex-row">
      <div class="flex items-center gap-3">
        <span @click="toggleVideoSound" class="cursor-pointer">
          <v-icon scale="1.4" :name="isMuted ? 'fa-volume-mute' : 'fa-volume-up'" />
        </span>
        <input type="range" :value="volume" @input="handleVolumeChange" min="1" max="100" class="" />
      </div>

      <div class="flex flex-col gap-y-8 items-center absolute bottom-16 sm:static">
        <div class="sm:hidden">$N0ME BRC-20 mint</div>
        <router-link to="/mint" class="text-black bg-white rounded-lg p-1 text-xl w-28 text-center">
          ENTER
        </router-link>
      </div>
      <div class="hidden sm:block">$N0ME BRC-20 mint</div>
    </div>
  </div>
</template>


<style scoped>
/********** Range Input Styles **********/
/*Range Reset*/
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 15rem;
}

/* Removes default focus */
input[type="range"]:focus {
  outline: none;
}

/***** Chrome, Safari, Opera and Edge Chromium styles *****/
/* slider track */
input[type="range"]::-webkit-slider-runnable-track {
  background-color: #b5b5b5;
  /* border-radius: 8px; */
  height: 0.8px;
}

/* slider thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* Override default look */
  appearance: none;
  margin-top: -12px;
  /* Centers thumb on the track */

  /*custom styles*/
  background-color: #fff;
  height: 1.6rem;
  border-radius: 8px;
  width: 0.6rem;
}

input[type="range"]:focus::-webkit-slider-thumb {
  border: none;
  outline: none;
}

/******** Firefox styles ********/
/* slider track */
input[type="range"]::-moz-range-track {
  background-color: #b5b5b5;
  border-radius: 8px;
  height: 0.8px;
}

/* slider thumb */
input[type="range"]::-moz-range-thumb {
  border: none;
  /*Removes extra border that FF applies*/
  border-radius: 8px !important;
  /*Removes default border-radius that FF applies*/

  /*custom styles*/
  background-color: #fff;
  height: 1.6rem;
  width: 0.6rem;
}

input[type="range"]:focus::-moz-range-thumb {
  border: none;
  outline: none;
}
</style>