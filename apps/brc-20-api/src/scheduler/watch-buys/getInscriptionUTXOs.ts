import { Order } from "@repo/brc-20-db"
import { HDKey } from "@scure/bip32"
import { getPaymentAddress } from "../../bitcoin/inscriptions/get-payment-address.js"
import { mempoolClient } from "../../bitcoin/mempool-client.js"

export async function getInscriptionUTXOs({
  orderKey,
  order,
}: {
  orderKey: HDKey
  order: Order
}) {
  const { inscribingAddress } = await getPaymentAddress(orderKey, order.amount)
  return mempoolClient.bitcoin.addresses.getAddressTxsUtxo({
    address: inscribingAddress,
  })
}
