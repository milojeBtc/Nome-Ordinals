import { Buff } from "@cmdcode/buff"
import { keys } from "@cmdcode/crypto-tools"
import { Address, ScriptData, Signer, Tap, Tx } from "@cmdcode/tapscript"

export const buildCommitData = async ({
  file,
  secret,
}: {
  file: Blob
  secret: Uint8Array
}) => {
  const fileData = new Uint8Array(await file.arrayBuffer())

  const marker = Buff.encode("ord")
  const mimetype = Buff.encode(file.type)

  const seckey = keys.get_seckey(secret)
  const pubkey = keys.get_pubkey(seckey, true)

  const script = [
    pubkey,
    "OP_CHECKSIG",
    "OP_0",
    "OP_IF",
    marker,
    "01",
    mimetype,
    "OP_0",
    fileData,
    "OP_ENDIF",
  ]

  const tapleaf = Tap.encodeScript(script)
  // Generate a tapkey that includes our leaf script. Also, create a merlke proof
  // (cblock) that targets our leaf and proves its inclusion in the tapkey.
  const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf })
  // A taproot address is simply the tweaked public key, encoded in bech32 format.
  const inscribingAddress = Address.p2tr.fromPubKey(
    tpubkey,
    process.env.NETWORK_MODE === "testnet" ? "testnet" : "main",
  )

  /* NOTE: To continue with this example, send 100_000 sats to the above address.
   * You will also need to make a note of the txid and vout of that transaction,
   * so that you can include that information below in the redeem tx.
   */

  // console.log("Your txhex:", Tx.encode(txdata).hex)
  // console.dir(txdata, { depth: null })

  return {
    inscribingAddress,
    cblock,
    tpubkey,
    seckey,
    script,
  }
}
export const buildInscriptionTx = ({
  utxo,
  cblock,
  tpubkey,
  seckey,
  script,
  recipientAddress,
  minerFee,
  price,
}: {
  cblock: string
  tpubkey: string
  seckey: Buff
  script: ScriptData
  recipientAddress: string
  utxo: {
    txid: string
    vout: number
    value: number
  }
  minerFee: number
  price: number
}) => {
  const pubkey = keys.get_pubkey(seckey, true)

  const tapleaf = Tap.encodeScript(script)

  const txdata = Tx.create({
    vin: [
      {
        // Use the txid of the funding transaction used to send the sats.
        txid: utxo.txid,
        // Specify the index value of the output that you are going to spend from.
        vout: utxo.vout,
        // Also include the value and script of that output.
        prevout: {
          // Feel free to change this if you sent a different amount.
          value: utxo.value,
          // This is what our address looks like in script form.
          scriptPubKey: ["OP_1", tpubkey],
        },
      },
    ],
    vout: [
      {
        // Postage to be used when transferring
        // should equal BASE_POSTAGE + (TRANSFER_FEE * FEE_RATE)
        value: utxo.value - price - minerFee,
        // This is the new script that we are locking our funds to.
        scriptPubKey: Address.toScriptPubKey(recipientAddress),
      },
    ],
  })

  if (price) {
    txdata.vout.push({
      value: price,
      scriptPubKey: Address.toScriptPubKey(process.env.TREASURY_ADDRESS!),
    })
  }

  // For this example, we are signing for input 0 of our transaction,
  // using the untweaked secret key. We are also extending the signature
  // to include a commitment to the tapleaf script that we wish to use.
  const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })

  // Add the signature to our witness data for input 0, along with the script
  // and merkle proof (cblock) for the script.
  txdata.vin[0].witness = [sig, script, cblock]

  // Check if the signature is valid for the provided public key, and that the
  // transaction is also valid (the merkle proof will be validated as well).
  Signer.taproot.verify(txdata, 0, { pubkey, throws: true })

  const { vsize: sizeInVBytes } = Tx.util.getTxSize(txdata)

  return { txdata, txHash: Tx.encode(txdata), sizeInVBytes }
}
