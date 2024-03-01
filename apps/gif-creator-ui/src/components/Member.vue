<script setup lang="ts">
import { available_rarity, rarityLabels } from "../constants/rarity.js";
import { ref } from "vue";
const quantity = ref(1);
const selectedRar = ref(0);
const rarity = ref(available_rarity);
const img = ref("");
</script>

<template>
  <div>
    <div class="py-5 pr-16 pl-5">
      <div class="min-h-[11.7rem] flex justify-between">
        <div>
          <a class="mx-0 mt-6 mb-20" href="/">
            <!--       <div style="" class="nome-logo headerLogo transition-transform duration-200 hover:scale-110">NōME</div>-->
            <img class="w-[21vw] min-w-[7.3rem] mt-1 transition-transform duration-200 hover:scale-110"
              src="../assets/images/logo_white.png" />
          </a>
        </div>

        <div>
          <a class="mx-0 mt-6 mb-20" target="_blank" href="https://nome.wtf/">
            <div class="text-white underline text-lg transition-transform hover:scale-110">
              nome.wtf
            </div>
          </a>
        </div>
      </div>
      <main>
        <div class="mt-1">
          <h1 class="text-2xl pb-2">• Memberships •</h1>
          <div class="border-b border-solid border-opacity-20 border-white md:mt-0 mt-12 w-full relative">
            <div class="absolute -top-12 right-4 lg:right-52 italic text-2xl text-center">
              Private <br />
              BTC ordinals <br />
              Community
            </div>
          </div>
        </div>
        <!--      <div class="pt-5"></div>-->

        <div class="p-0 w-full sm:w-[66.6%] lg:w-[63%] xl:w-[60%] 2xl:w-[57%] mt-12 mb-12 text-lg">
          NōME is a decentralized space with no authority, it is a community of
          people who are passionate about AI art, Bitcoin, and new tech. We
          started back in January 2023, when software engineer Casey Rodarmor
          launched the Ordinals Theory, creating a Bitcoin NFT renaissance.
          Since then NōME became an open space for Ordinals builders and
          innovators to connect.
        </div>

        <div>
          <div class="flex w-full flex-wrap">
            <div class="w-full sm:w-1/2 pr-4 pl-4 flex-fill flex items-center justify-center">
              <div class="h-full w-full" style="margin: 0px; isolation: isolate">
                <div class="border border-solid border-white border-opacity-20 p-6 h-full w-full">
                  <img class="w-full" src="../assets/images/NOME-memb.png" />
                </div>
              </div>
            </div>
            <div class="w-full sm:w-1/2 pr-4 pl-4">
              <div class="w-full">
                <div class="h-9 mt-3">GIF Quantity</div>
                <input type="number" v-model="quantity"
                  class="border border-solid border-white bg-transparent h-8 rounded-xl text-right pr-3 text-white max-w-[50%]" />
                <div class="h-9 mt-4">Rarity</div>
              </div>

              <div class="flex flex-col flex-wrap sm:flex-row gap-8">
                <div v-for="(item, index) in rarity" :key="index" class="text-center basis-full sm:basis-[45%]">
                  <button type="button" @click="selectedRar = index" :class="index == selectedRar ? 'bg-gray-500' : 'bg-transparent'
                    "
                    class="border-solid border border-white cursor-pointer uppercase h-8 w-full transition-all text-white rounded-xl text-base">
                    {{ rarityLabels[item as keyof typeof rarityLabels] }}
                  </button>
                </div>
              </div>
              <div class="flex mt-3 justify-between w-full text-gray-500">
                <div>Total items</div>
                <div>{{ quantity }}</div>
              </div>
              <div class="flex justify-between w-full text-gray-500">
                <div>Iscription fees</div>
                <div>0.01</div>
              </div>
              <div class="flex justify-between w-full text-gray-500">
                <div>Final BTC price</div>
                <div>{{ 0.1 * quantity }}</div>
              </div>
            </div>
          </div>

          <div class="w-full flex flex-wrap">
            <div class="w-full sm:w-1/2 pr-4 pl-4 p-0">
              <div class="w-full p-0 text-left min-h-[2.2rem] mt-3">
                NōME Memberships collection is created with the most innovative
                Ordinals Recursion technology, that allows through html code to
                call another inscription on chain.
              </div>
              <!--      <div class="w-full text-left input-title">Link to transaction</div>-->
            </div>

            <div class="w-full sm:w-1/2 pr-4 pl-4">
              <div>
                <div class="flex justify-center pt-5">
                  <a
                    class="mx-0 mt-6 mb-20 min-w-[13.3rem] py-2 px-0 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black p-1 cursor-pointer z-10 rounded-xl">
                    INSCRIBE
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div class="py-0 px-5 text-xl">
      <div class="mt-12 pt-12">
        <!--    <h1 class="intro-title">I AM NOME</h1>-->
        <div class="border-b border-solid border-opacity-20 border-white pt-2 md:mt-0 mt-12 w-full relative">
          <div class="absolute -top-12 right-4 text-2xl lg:right-56 text-center">
            <div class="transition-transform duration-200 hover:scale-110">
              <a class="mx-0 mt-6 mb-20 text-white underline text-2xl underline-offset-[0.4rem]" target="_blank"
                href="https://twitter.com/nome_nft">
                Twitter</a>
            </div>

            <div class="transition-transform duration-200 hover:scale-110 mt-2">
              <a class="mx-0 mt-6 mb-20 text-white underline text-2xl underline-offset-[0.4rem]" target="_blank"
                href="https://discord.gg/ffZKc2TfN4">Discord</a>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full flex justify-between mt-5 pt-5 pb-4">
        <div class="pr-5">• it is not about me •</div>
        <div class="menu-link pl-5">
          <a class="mx-0 mt-6 mb-20" target="_blank" href="https://nome.wtf/">
            <div
              class="text-white underline text-xl underline-offset-[0.4rem] transition-transform duration-200 hover:scale-110">
              nome.wtf
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
