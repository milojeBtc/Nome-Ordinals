<script setup lang="ts">
import {
  AddressPurpose,
  getAddress,
} from "sats-connect";

import { useMutation, useQuery } from "@tanstack/vue-query";
import { computed, onMounted, ref } from "vue";
import { inscribeApi } from "../api/inscribe.ts";
import { fileToBase64 } from "../util/fileToBase64.ts";
import axios from "axios";
import SelectRarity from "./shared/SelectRarity.vue";
import Footer from "./shared/Footer.vue";
import { network } from "../constants/bitcoin.ts";
import GetBetaAccess from "./GetBetaAccess.vue";
import OrdersForAddress from "./OrdersForAddress.vue";
import { FeeRateSelector } from "@repo/shared-ui"
import Header from "./shared/Header.vue";
import GIFPreview from "./GIFPreview.vue";
import { usePriceQuery } from "../api/queries/price";
import MintInfo from "./MintInfo.vue";
import { CompressAble, OrderingState } from "../constants/inscriptions";
import InscribeButton from "./ui/InscribeButton.vue";
import InscribeUnisatButton from "./ui/InscribeUnisatButton.vue";
import InscribeLeatherButton from "./ui/InscribeLeatherButton.vue";
import { sendBTC } from '../util/sendBTC'
import FrameManager from "./FrameManager.vue";
import { getWalletAddresses } from "../util/getWalletAddresses";

import { Modal } from "@repo/shared-ui";


const files = ref<Array<CompressAble>>([]);
const selectedRarity = ref("random");
const feeRate = ref("")
const quantity = ref(1);

const paymentTxId = ref("");
const gifSrc = ref("");
const gifCompilationProgress = ref(0);
const isCompilingGIF = ref(false);
const showGetBetaAccess = ref(true);

const isPreviewOpen = ref(false);
const changePreviewStatus = (status: boolean) => {
  isPreviewOpen.value = status;
};

onMounted(() => {
  if (window.localStorage.getItem("has-beta-access")) {
    showGetBetaAccess.value = false;
  }
});

const orderingState = ref(OrderingState.None);

function handleGifProgress(progress: number) {
  if (gifSrc.value) {
    URL.revokeObjectURL(gifSrc.value);
    gifSrc.value = "";
  }
  if (!isCompilingGIF.value) {
    isCompilingGIF.value = true
  }
  gifCompilationProgress.value = progress
}

function handleGIFGenerated(
  [gifUrl, frames]: [
    string,
    CompressAble[]
  ]
) {
  isCompilingGIF.value = false
  gifSrc.value = gifUrl;
  files.value = frames
}

const { data: totalFee, dataUpdatedAt } = usePriceQuery({
  feeRate: computed(() => Number(feeRate.value)),
  frameCount: computed(() => files.value.length),
  imageSizes: computed(() => files.value.map(file => file.compressed.size)),
  mintQuantity: quantity,
  selectedRarity
})

const openPreview = () => {
  changePreviewStatus(true);
};

const { data: usdPrice } = useQuery({
  queryKey: ["coinCap"],
  enabled: () => Boolean(totalFee.value && dataUpdatedAt.value),
  refetchInterval: () => {
    const now = new Date().getTime();
    const shouldRefresh = Boolean(
      totalFee.value &&
      dataUpdatedAt.value &&
      now - dataUpdatedAt.value < 20_000
    );

    return shouldRefresh ? 20_000 : false;
  },
  queryFn: async () => {
    const response = await axios.get(
      "https://api.coincap.io/v2/rates/bitcoin",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return Number(response.data.data.rateUsd);
  },
});

const createInscriptionOrderMut = useMutation({
  mutationKey: ["inscribe", files, selectedRarity, quantity, feeRate],
  mutationFn: async ({
    ordinalAddress,
    paymentAddress
  }: {
    ordinalAddress: string;
    paymentAddress: string;
  }) => {
    const fileData = [];
    for (const file of files.value) {
      fileData.push({
        dataURL: await fileToBase64(file.compressed),
        duration: file.duration,
        name: file.original.name,
        size: file.compressed.size,
        type: file.compressed.type,
      });
    }
    const {
      data: {
        payment_details: { address, amount },
      },
    } = await inscribeApi({
      files: fileData,
      feeRate: Number(feeRate.value),
      payAddress: paymentAddress,
      rarity: selectedRarity.value as any,
      receiverAddress: ordinalAddress,
    });

    return {
      address,
      amount,
    };
  },
});

const LeatherWalletGetter = (userAddresses: any) => {
  let ordinalAddress = '';
  let paymentAddress = '';

  userAddresses.result.addresses
    .map((address: any) => {
      if (address.type === 'p2wpkh') {
        paymentAddress = address.address;
      } else if (address.type === 'p2tr') {
        ordinalAddress = address.address;
      }
    });

  return {
    ordinalAddress,
    paymentAddress
  }
}

async function waitXV() {
  try {
    orderingState.value = OrderingState.RequestingWalletAddress;
    await getAddress({
      payload: {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message:
          "We need the address you'll use to pay for the service, and the address where you want to receive the Ordinals.",
        network: {
          type: network,
        },
      },
      onFinish: async (response) => {
        orderingState.value = OrderingState.WaitingForCreation;

        const { ordinalAddress, paymentAddress } = getWalletAddresses(response)
        const { address, amount } = await createInscriptionOrderMut.mutateAsync({
          ordinalAddress,
          paymentAddress
        });

        console.log('address ==> ', address);
        console.log('amount ==>', amount)

        orderingState.value = OrderingState.WaitingForPayment;

        sendBTC({
          address,
          amount,
          network,
          paymentAddress,
        })
          .then((txId) => {
            paymentTxId.value = txId;
            orderingState.value = OrderingState.None;
          })
          .catch(() => {
            orderingState.value = OrderingState.None;
          });
      },
      onCancel: () => {
        orderingState.value = OrderingState.None;
      },
    });
  } catch (err) {
    orderingState.value = OrderingState.None;
  }
}

async function waitUni() {
  try {
    orderingState.value = OrderingState.RequestingWalletAddress;
    let accounts = await (window as any).unisat.requestAccounts();
    console.log(accounts);

    const ordinalAddress = accounts[0];
    const paymentAddress = accounts[0];

    console.log('ordinalAddress ==> ', ordinalAddress);
    console.log('paymentAddress ==> ', paymentAddress);

    const { address, amount } = await createInscriptionOrderMut.mutateAsync({
      ordinalAddress,
      paymentAddress
    });

    console.log('address ==> ', address);
    console.log('amount ==> ', amount);

    const txId = await (window as any).unisat.sendBitcoin(address, amount);

    paymentTxId.value = txId;
    orderingState.value = OrderingState.None;

  } catch (err) {
    console.log('unisat error ==> ', err);
    orderingState.value = OrderingState.None;
  }
}

async function waitLea() {
  try {
    orderingState.value = OrderingState.RequestingWalletAddress;
    const userAddresses = await (window as any).btc?.request('getAddresses');

    const { ordinalAddress, paymentAddress } = LeatherWalletGetter(userAddresses);

    const { address, amount } = await createInscriptionOrderMut.mutateAsync({
      ordinalAddress,
      paymentAddress
    });

    orderingState.value = OrderingState.WaitingForPayment;

    const resp = await (window as any).btc?.request('sendTransfer', {
      address,
      amount
    });

    console.log(resp.result.txid)

    paymentTxId.value = resp.result.txid;
    orderingState.value = OrderingState.None;

  } catch (err) {
    orderingState.value = OrderingState.None;
  }
}

const handleContactAdded = () => {
  window.localStorage.setItem("has-beta-access", "true");
  showGetBetaAccess.value = false;
};
</script>
<template>
  <div class="">
    <div class="pt-[25px] px-[25px] pb-0">
      <Header />
      <main>
        <div class="mt-6">
          <h1 class="text-2xl pb-2">• Stop motion tool •</h1>
          <div
            class="border-b border-solid border-opacity-20 border-white md:mt-0 mb-44 sm:mb-16 xl:mb-12 w-full relative">
            <div
              class="absolute left-0 top-8 sm:-top-12 sm:left-auto sm:right-4 lg:right-52 italic text-2xl sm:text-center">
              Resize <br />
              and Inscribe <br />
              Animations
            </div>
          </div>
        </div>
        <div class="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base">
          <span class="lg:block">
            This is a platform for the community to explore the potential of
            Bitcoin Ordinals,
          </span>
          <span class="lg:block">
            enabling the creation of recursive animations, resizing images, and
            inscriptions on rare sats all in one place.
          </span>

          <br /><br />
          <div class="mt-12  h-[50vh]" v-if="showGetBetaAccess">
            <GetBetaAccess @addContact="handleContactAdded" />
          </div>
        </div>
        <section v-if="!showGetBetaAccess">
          <div class="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base mb-12">
            1. Upload PNG or JPEG frames (10 Max);
            <br />
            2. Set order, timing, and .webp file size;
            <br />
            3. Generate GIF, set quantity and rarity;
            <br />
            4. Inscribe frames + recursive GIFs.
          </div>

          <FrameManager @generated="handleGIFGenerated" @progress="handleGifProgress" />

          <div>
            <div class="flex flex-col md:flex-row w-full gap-x-12 mt-4">
              <div class="basis-full md:basis-1/2 flex justify-center">
                <GIFPreview :img-src="gifSrc" :is-loading="isCompilingGIF" :progress="gifCompilationProgress" />
              </div>
              <!-- col-12 col-sm-6 flex-fill frame-box d-flex align-items-center justify-content-center -->
              <div class="basis-full md:basis-1/2 flex-col flex max-w-lg mx-auto md:mx-0">
                <div class="w-full">
                  <div class="h-9 text-lg sm:text-base mb-1 mt-8">
                    GIF Quantity
                  </div>
                  <input type="number" v-model="quantity"
                    class="border border-solid border-white bg-transparent h-10 rounded-xl text-right pr-3 text-white w-full" />
                  <div class="h-9 mt-10 text-lg sm:text-base mb-1">Rarity</div>
                </div>
                <SelectRarity :selected-rarity="selectedRarity" @update:selected-rarity="selectedRarity = $event" />
                <div class="mt-14 mb-7">
                  <FeeRateSelector v-model="feeRate" />
                </div>
                <MintInfo v-if="gifSrc && files.length > 0" :frames-count="files.length" :mint-quantity="quantity"
                  :total-fee="totalFee" :usd-price="usdPrice" />

                <div class="w-full pr-4 pl-4">
                  <div>
                    <div class="flex flex-col items-center pt-12 w-full mt-6">
                      <Modal :is-open="isPreviewOpen" @on-visibility-change="changePreviewStatus">
                        <div
                          class="py-10 px-20 bg-white text-black text-[24px] rounded-lg text-base flex flex-col gap-y-4">
                          <p class="text-center pb-5">
                            Select a Wallet
                          </p>
                          <InscribeButton @inscribe="waitXV" :ordering-state="orderingState" />
                          <InscribeUnisatButton @inscribe="waitUni" :ordering-state="orderingState" />
                          <InscribeLeatherButton @inscribe="waitLea" :ordering-state="orderingState" />
                        </div>
                      </Modal>
                      <div @click="openPreview" class="bg-white py-2 px-10 rounded-lg text-black cursor-pointer">
                        Inscribe
                      </div>
                      <div class="w-full flex flex-col items-center mt-7" v-if="paymentTxId">
                        <div class="w-full text-left input-title">Thank you for creating art with us!</div>
                        <a :href="'https://mempool.space/tx/' + paymentTxId"
                          class="text-left input-title underline underline-offset-4">
                          Mempool link
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <OrdersForAddress />

          </div>
        </section>
      </main>
    </div>
    <Footer />
  </div>
</template>