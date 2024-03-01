import { HDKey } from "@scure/bip32"
import { buildCommitData } from "./inscribe.js"

export const buildTransferJSON = (amount: number) => {
  return new Blob(
    [`{"p":"brc-20","op":"transfer","tick":"N0ME","amt":"${amount}"}`],
    {
      type: "application/json",
    },
  )
}
export const getPaymentAddress = (key: HDKey, amount: number) => {
  return buildCommitData({
    file: buildTransferJSON(amount),
    secret: key.privateKey!,
  })
}
