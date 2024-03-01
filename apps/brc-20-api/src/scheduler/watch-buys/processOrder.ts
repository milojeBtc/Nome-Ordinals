import { Order, Claim } from "@repo/brc-20-db"
import { getKeyForIndex } from "../../bitcoin/keys/server-keys.js"
import { logger } from "../../server.js"
import { getInscriptionUTXOs } from "./getInscriptionUTXOs.js"
import { inscribeAndTransferBRC_20 } from "./inscribeAndTransferBRC_20.js"
import { markOrderComplete } from "./markOrderComplete.js"

export async function processOrder({
  order,
}: {
  order: Order & { claim: Claim | null }
}) {
  const orderKey = await getKeyForIndex(order.id, true)
  const firstKey = await getKeyForIndex(0, true)

  const utxos = await getInscriptionUTXOs({
    order,
    orderKey,
  })

  if (utxos.length) {
    logger.info(`Found ${utxos.length} utxos for order ${order.id}`)
    const [utxo] = utxos
    const { transferTxId } = await inscribeAndTransferBRC_20({
      firstKey,
      order,
      orderKey,
      utxo,
    })

    await markOrderComplete({
      order,
      paymentTxId: utxo.txid,
      transferTxId,
    })
    logger.info(`Completed processing order ${order.id}`)
  }
}
