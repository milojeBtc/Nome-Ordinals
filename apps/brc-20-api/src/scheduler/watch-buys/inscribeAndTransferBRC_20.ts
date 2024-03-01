import { Tx } from "@cmdcode/tapscript"
import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses.js"
import { Order, Claim } from "@repo/brc-20-db"
import { HDKey } from "@scure/bip32"
import { transferInscription } from "../../bitcoin/inscriptions/transfer-inscription.js"
import { postTx } from "../../bitcoin/mempool-client.js"
import { logger } from "../../server.js"
import { inscribeTransfer } from "./inscribeTransfer.js"

export async function inscribeAndTransferBRC_20({
  firstKey,
  order,
  orderKey,
  utxo,
}: {
  firstKey: HDKey
  order: Order & { claim: Claim | null }
  orderKey: HDKey
  utxo: AddressTxsUtxo
}) {
  const inscribeTxData = await inscribeTransfer({
    firstKey,
    order,
    orderKey,
    paymentUTXO: utxo,
  })

  const inscribeTxId = Tx.util.getTxid(inscribeTxData)

  logger.info(`Inscription txid: ${inscribeTxId}`)

  const transferTx = await transferInscription({
    key: firstKey,
    recipientAddress: order.receiveAddress,
    utxo: {
      txid: Tx.util.getTxid(inscribeTxData),
      value: Number(inscribeTxData.vout[0].value),
      vout: 0,
    },
  })

  const transferTxId = await postTx(Tx.encode(transferTx).hex)

  logger.info(`Transfer txid: ${transferTxId}`)

  return {
    inscribeTxId,
    transferTxId,
  }
}
