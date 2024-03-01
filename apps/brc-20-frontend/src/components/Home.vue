<script setup lang="ts">
import { ref, computed } from "vue";

import Footer from "./shared/Footer.vue";
import Header from "./shared/Header.vue";
import { useQuery, useMutation } from '@tanstack/vue-query'
import { client } from "../api/client";
import { sendBtcTransaction, BitcoinNetworkType, getAddress, AddressPurpose } from 'sats-connect'

import { validate as validateBTCAddress } from 'bitcoin-address-validation'
import { useMintProgress } from "../api/queries/mint-progress";
import { makeTwitterPost } from "../util/makeTwitterPost";
import {
  FeeRateSelector,
  DisclaimerCheckbox,
  Modal,
  NumberInput,
  PriceItem,
} from "@repo/shared-ui";
import SaleProgress from "./SaleProgress.vue";
import { useBTCPrice } from "../api/queries/coin-cap-btc-price";



const unformattedAddress = ref("");
const address = computed(() => {
  return unformattedAddress.value.trim()
})
const quantity = ref("");



const { refetch: checkWLClaim, isSuccess: isClaimChecked } = useQuery({
  queryKey: ['wl check', address],
  queryFn: () => client.provide('get', '/check-claim', {
    address: address.value,
  }),

  enabled: false
})
const isAddressChecked = ref(false)
const checkClaim = async () => {
  // if (isWhiteListOpen.value) {
  const { data } = await checkWLClaim()
  if (data && data.status === 'success') {
    const claimInfo = data.data
    quantity.value = String(claimInfo.freeAmount)
    eligibleFreeAmount.value = claimInfo.freeAmount
    isWhiteListed.value = claimInfo.isWhitelisted
    isAddressChecked.value = true
  }
  // }

}

const eligibleFreeAmount = ref(0)

const {
  data: isWhiteListOpen
} = useQuery({
  queryKey: ['whitelist status'],
  queryFn: async () => {
    const response = await client.provide('get', '/whitelist/status', {})
    if (response.status === 'success') {
      return response.data.open
    }
    return false
  }
})

const isWhiteListed = ref(false)

const userPaid = ref(true)


const isAmountValid = computed(() => {
  let min = 5000
  if (eligibleFreeAmount.value) {
    min = eligibleFreeAmount.value
  }
  const amount = Number(quantity.value)
  return amount > 0
    && amount % 1000 === 0
    && amount >= min
    && amount <= 1_000_000
})

const isFormValid = computed(() => {
  return isAmountValid.value
})

const feeRate = ref('1')

const priceQ = useQuery({
  queryKey: ['price', feeRate, quantity, address],
  queryFn: () => {
    return client.provide('get', '/price', {
      feeRate: String(feeRate.value),
      amount: String(quantity.value),
      address: address.value,
    })
  },
  enabled: () => {
    return Boolean(
      feeRate.value
      && quantity.value
      && address.value
      && isFormValid.value
      && isAddressValid.value
    )
  },
})

const priceData = computed(() => {
  return priceQ.data.value?.status !== 'success' ? null : priceQ.data.value.data
})


const paymentTx = ref('')
const orderDetails = ref({
  address: '',
  amount: 0
})
const createOrderM = useMutation({
  mutationKey: ['createOrder', quantity, address, feeRate],
  mutationFn: async ({ xverse }: { xverse: boolean }) => {
    if (!address.value || !quantity.value || !feeRate.value) {
      return
    }
    const data = await client.provide('post', '/orders', {
      receiveAddress: address.value,
      amount: Number(quantity.value),
      feeRate: Number(feeRate.value),
    })

    if (data.status === 'success') {
      await checkClaim()
      const {
        paymentAddress,
        totalPrice
      } = data.data


      const networkType = import.meta.env.VITE_APP_BITCOIN_NETWORK === 'testnet'
        ? BitcoinNetworkType.Testnet
        : BitcoinNetworkType.Mainnet;

      if (xverse) {
        getAddress({
          payload: {
            message: `We will need this address to pay for your order.`,
            network: {
              type: networkType,
            },
            purposes: [AddressPurpose.Payment]
          },
          onFinish(address) {
            sendBtcTransaction({
              payload: {
                network: {
                  type: networkType
                },
                recipients: [
                  {
                    address: paymentAddress,
                    amountSats: BigInt(totalPrice)
                  }
                ],
                senderAddress: address.addresses[0].address,
              },
              onCancel: () => {
                console.log('cancelled')
              },
              onFinish: (tx) => {
                userPaid.value = true
                paymentTx.value = `${import.meta.env.VITE_APP_MEMPOOL_URL}/tx/${tx}`
              }
            })
          },
          onCancel() { }
        })
      } else {
        isPreviewOpen.value = true
        orderDetails.value = {
          address: paymentAddress,
          amount: totalPrice
        }
      }

    }
  }
})

const disclaimersCheck = ref([false, false])
const consented = computed(() => {
  if (isWhiteListOpen.value) {
    return disclaimersCheck.value.every(item => item)
  }
  return disclaimersCheck.value[1]
})
const isAddressValid = computed(() => validateBTCAddress(address.value))
const isEligibleToMint = computed(() => {
  const wl = isClaimChecked.value && isWhiteListOpen.value && isWhiteListed.value
  const publicSale = isAddressChecked.value && !isWhiteListOpen.value
  const shouldMint = wl || publicSale
  // return import.meta.env.DEV;
  return shouldMint
})

const { data: usdPrice } = useBTCPrice();

const progress = useMintProgress()

const isPreviewOpen = ref(false);
const changePreviewStatus = (status: boolean) => {
  isPreviewOpen.value = status;
};

const saleWording = computed(() => {
  return eligibleFreeAmount.value ? "Claim" : "Buy"
})

</script>
<template>
  <Modal :is-open="isPreviewOpen" @on-visibility-change="changePreviewStatus">
    <div class="p-4 bg-[#252525] w-full rounded-lg text-base flex flex-col gap-y-4  sm:max-w-2xl">
      <p>To complete the order</p>
      <p>Please send: {{ (orderDetails.amount / 1e8).toFixed(8) }} BTC</p>
      <p>To {{ orderDetails.address }}</p>
    </div>
  </Modal>
  <div class="">
    <div class="pt-[25px] px-[25px] pb-0">
      <Header />
      <main>
        <div class="mt-6">
          <h1 class="text-2xl pb-2 border-b border-solid border-opacity-20 border-white">• $N0ME BRC-20 •</h1>
          <div class="md:mt-0 mb-44 sm:mb-16 xl:mb-12 w-full relative">
            <div
              class="absolute left-0 top-8 sm:-top-12 sm:left-auto sm:right-4 lg:right-52 italic text-2xl sm:text-center">
              BTC token <br />
              that has cool <br />
              Utility
            </div>
          </div>
        </div>
        <div class="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base">
          <span class="block mb-12 mt-24">
            NōME is a brand that changes the world by bringing art back to people. The brand name translates as no one or
            no ID. We prioritize privacy and create solutions to empower people to own their data. We launched the first
            crowdfunding mint, leveraging the modern Bitcoin BRC-20 technology. BRC-20 is an experimental standard for
            fungible tokens on the L1 Bitcoin blockchain.
          </span>
          <span class="block mb-12">
            $NOME BRC-20 give access to "NOME gallery" – the world's first luxury Ordinals Art Gallery on Bitcoin that
            showcases the works of some of the best contemporary artists. Our mission is to support digital artists of
            various art styles and help them share their visionary creations with audiences by staying at the forefront of
            innovation.
          </span>
        </div>


        <div class="pb-12 pt-2 md:mt-8 mt-12 w-full relative">
          <h3 class="my-8 text-xl">Welcome</h3>
          <div class="flex flex-col-reverse sm:flex-row items-start gap-6 mt-6 w-full">
            <button
              class="bg-white text-black md:w-[20%] w-full p-1.5 rounded-md whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
              :disabled="!consented || !isAddressValid" @click="checkClaim()">
              {{ isWhiteListOpen ? 'WL Access' : 'ENTER' }}
            </button>
            <div>
              <input type="text" placeholder="Ordinals wallet address" v-model="unformattedAddress"
                class="border-white border-2 border-solid border-opacity-40 p-1.5 w-full rounded-[10px] bg-transparent outline-none" />
              <div class="mt-8 relative sm:-left-12 gap-y-4 flex flex-col">
                <DisclaimerCheckbox v-if="isWhiteListOpen" v-model="disclaimersCheck[0]"
                  text="If you are a holder, please, provide the wallet address that holds the 1/1 art." />
                <DisclaimerCheckbox v-model="disclaimersCheck[1]"
                  text="Confirm that I want to receive tokens to this Ordinals address" />
              </div>
            </div>
          </div>
        </div>
        <div class="border-t border-solid border-opacity-20 border-white"></div>
        <div class="py-8" v-show="isClaimChecked && eligibleFreeAmount">
          <p class="text-green">
            <span class="">Congratulations!</span>

            You got
            {{ eligibleFreeAmount.toLocaleString() }}
            FREE $N0ME tokens. <br />
            The next step is to pay the network fees below, feel free to add extra tokens on top.
          </p>
          <!-- <p v-else-if="isWhiteListOpen && isWhiteListed">
            Welcome to the Whitelist mint! You have <span class="text-green">10 minutes</span> to purchase the
            $N0ME tokens.
          </p>
          <p class="mt-4" v-else>
            Sorry, your wallet is not registered for Whitelist,
            <span class="text-green">public $N0ME mint</span> starts in 2 hours after the WL.
          </p> -->
        </div>

        <div v-if="isEligibleToMint" class="pt-2 md:mt-8 mt-12 mb-12 w-full relative">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 my-6 w-full lg:w-[80%]">
            <!-- <div class="mt-10"> -->
            <!-- <div :class="eligibleFreeAmount > 0 ? 'visible' : 'invisible'">
                <span class="text-green text-xl">Congratulations!</span>
                <p class="text-xl">You claimed {{ eligibleFreeAmount }} free NOME tokens</p>
                <p class="mt-4 text-[#5A5A5A]">To receive them, please, proceed with the Network fees payment below.</p>
              </div> -->
            <!-- <img class="my-8 w-full object-fill" src="/chart.png" alt="Chart" /> -->
            <!-- </div> -->

            <div class="w-full sm:ml-12">
              <div class="flex items-center justify-center">
                <!-- <img src="/stats.png" class="" alt="Stats" /> -->
                <SaleProgress />
              </div>
              <div class="my-16 flex flex-col">
                <label>
                  <div class="mb-4 text-xl">
                    Total quantity
                  </div>
                  <NumberInput placeholder="min 5,000 / max 1,000,000" v-model="quantity"
                    class="border-white border-2 border-solid border-opacity-40 p-1.5 w-full rounded-[10px] bg-transparent outline-none" />
                  <p class="mt-2 text-pink text-sm" v-if="!isAmountValid">
                    Please, make sure to place integer numbers with no hundreds (e.g. 1,000 | 18,000 | 111,001,000) within
                    the min & max range
                  </p>
                </label>
              </div>
              <FeeRateSelector v-model="feeRate" />

              <div :class="priceQ.isSuccess.value ? 'visible' : 'invisible'"
                class="mt-8 flex flex-col gap-2 text-[#5a5a5a] text-xl">
                <PriceItem label="Tokens price BTC:" :value="((priceData?.brc20Price || 0) / 1e8).toFixed(8)" />
                <PriceItem label="Network Fee:" :value="((
                  (priceData?.minerFees || 0) +
                  (priceData?.basePostage || 0)
                ) / 1e8).toFixed(8)" />
                <PriceItem label="Total BTC:" :value="((priceData?.total || 0) / 1e8).toFixed(8)" />
                <PriceItem v-if="usdPrice" label="Total USD:"
                  :value="`$${(usdPrice * (priceData?.total || 0) / 1e8).toFixed(2)}`" />

              </div>
              <button :disabled="!isFormValid && progress < 50_000_000"
                class="text-black bg-white w-full rounded-lg p-1 text-xl mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
                @click="createOrderM.mutate({ xverse: true })">
                {{ saleWording }} with Xverse
              </button>
              <button :disabled="!isFormValid && progress < 50_000_000"
                class="text-black bg-white w-full rounded-lg p-1 text-xl mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
                @click="createOrderM.mutate({ xverse: false })">
                {{ saleWording }} with other wallet
              </button>
              <p class="text-center text-xl text-[#5a5a5a] mt-4" v-if="paymentTx">
                Link to the <a :href="paymentTx" target="_blank" rel="noreferrer noopener"
                  class="underline underline-offset-8 hover:underline">mempool</a>
              </p>
              <button v-if="userPaid" class="text-black bg-white w-full rounded-lg p-1 text-xl mt-16"
                @click="makeTwitterPost()">
                Post on Twitter
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div class="pt-48">
      <Footer />
    </div>
  </div>
</template>

<style scoped></style>
