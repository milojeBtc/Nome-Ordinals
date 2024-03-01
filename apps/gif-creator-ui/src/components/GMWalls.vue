<script setup lang="ts">
import { available_rarity } from "../constants/rarity";
import { ref } from "vue";
// import { useAuthStore } from "../stores/auth";

const selectedRarity = ref(available_rarity[0]);
// const auth = useAuthStore();
</script>
<template>
  <div class="">
    <div class="py-5 pt-8 px-10">
      <div class="min-h-[11.7rem] flex justify-between">
        <div>
          <a class="mx-0 mt-6 mb-20" href="/">
            <!--       <div style="" class="nome-logo headerLogo transition-transform duration-200 hover:scale-110">NōME</div>-->
            <img class="w-48 sm:w-[21vw] min-w-[7.3rem] mt-1 transition-transform duration-200 hover:scale-110"
              src="../assets/images/logo_white.png" />
          </a>
        </div>

        <div>
          <a class="mx-0 mt-6 mb-20" target="_blank" href="https://nome.wtf/">
            <div
              class="text-white underline text-lg transition-all duration-75 hover:italic underline-offset-8 hover:underline">
              nome.wtf
            </div>
          </a>
        </div>
      </div>
      <main>
        <div class="mt-1">
          <h1 class="text-2xl pb-2">• Walls → Digital Artifacts •</h1>
          <div
            class="border-b border-solid border-opacity-20 border-white md:mt-0 mb-44 sm:mb-16 xl:mb-12 w-full relative">
            <div
              class="absolute left-0 top-8 sm:-top-12 sm:left-auto sm:right-4 lg:right-52 italic text-2xl sm:text-center">
              BTC Ordinals <br />
              collection of <br />
              phone wallpapers
            </div>
          </div>
        </div>
        <!--      <div class="pt-5"></div>-->

        <div class="p-0 w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base">
          <span class="lg:block">
            I wish Bitcoin Ordinals to become a part of our life, so I have
            created “Walls”.
          </span>
          <span class="lg:block">
            Images are designed and formatted to be used as phone wallpapers.
            Now people can enjoy
          </span>
          <span class="lg:block">
            art throughout the day while using the phone. That simple utility
            and innovative idea are able to drive the Bitcoin Ordinals
            mainstream adoption.
          </span>
        </div>

        <div>
          <div class="flex flex-col md:flex-row w-full gap-x-8">
            <div class="basis-full md:basis-1/2 flex justify-center">
              <div class="p-6 border border-opacity-20 border-white max-h-[30rem] w-full">
                <img alt="" class="w-full h-full object-contain" />
              </div>
            </div>
            <!-- col-12 col-sm-6 flex-fill frame-box d-flex align-items-center justify-content-center -->
            <div class="basis-full md:basis-1/2">
              <div class="w-full">
                <div class="h-9 mt-8 text-lg sm:text-base mb-1">Quantity</div>
                <input type="number"
                  class="border border-solid border-white bg-transparent h-10 rounded-xl text-right pr-3 text-white w-full sm:w-[45%]" />
                <div class="h-9 mt-8 text-lg sm:text-base mb-1">Rarity</div>
              </div>
              <SelectRarity :selected-rarity="selectedRarity" @update:selected-rarity="selectedRarity = $event" />
              <!-- <div :class="showGIF && files.length > 0 ? 'visible' : 'invisible'">
                <div class="flex mt-3 justify-between text-gray-500">
                  <div>Frames</div>
                  <div>{{ files.length }}</div>
                </div>
                <div class="flex justify-between text-gray-500">
                  <div>Total items</div>
                  <div>{{ files.length + quantity }}</div>
                </div>
                <div class="flex justify-between text-gray-500">
                  <div>Final USD price</div>
                  <div v-show="usdPrice && totalFee">
                    ${{ (usdPrice * totalFee).toFixed(2) }}
                  </div>
                </div>
                <div class="flex justify-between text-gray-500">
                  <div>Final BTC price</div>
                  <div>{{ totalFee && totalFee.toFixed(8) }}</div>
                </div>
              </div> -->
              <div class="w-full pr-4 pl-4">
                <div>
                  <div class="flex justify-center pt-12 w-full">
                    <!-- <button @click="waitXV"
                      class="mx-0 mt-6 mb-20 min-w-[13.3rem] py-2 px-0 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black p-1 cursor-pointer z-10 rounded-xl">
                      INSCRIBE
                    </button> -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="w-full flex flex-wrap">
            <div class="w-full sm:w-1/2 pr-4 pl-4">
              <!--      <div class="w-full text-left input-title mt-3">Thank you</div>-->
              <!--      <div class="w-full text-left input-title">Link to transaction</div>-->
            </div>
          </div>
        </div>
      </main>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
input[type="range"] {
  @apply appearance-none flex items-center h-px w-full m-0 p-0 border-0;
}

input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none bg-white h-8 w-4 sm:h-6 sm:w-3 rounded-lg;
}
</style>
