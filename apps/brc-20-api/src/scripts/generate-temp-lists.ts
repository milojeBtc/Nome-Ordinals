import { gen_seckey, get_pubkey } from "@cmdcode/crypto-tools/keys"
import { Address, Networks } from "@cmdcode/tapscript"

function genRandomAddress(network: Networks) {
  const secretKey = gen_seckey()
  const publicKey = get_pubkey(secretKey)
  return Address.p2tr.fromPubKey(publicKey, network)
}

const networks = ["testnet", "mainnet"]
async function main() {
  const network = process.argv[2] || "testnet"
  const freeAmount = process.argv[3] || 1000

  if (networks.indexOf(network) === -1) {
    throw new Error(`Invalid network: ${network}`)
  }
  for (let i = 0; i < 10; i++) {
    const address = genRandomAddress(network as Networks)
    console.log([address, freeAmount].toString())
  }
}

await main()
