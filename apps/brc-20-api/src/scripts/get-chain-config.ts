import {
  getHDKey,
  getKeyByIndex,
  getTaprootAddress,
} from "../bitcoin/keys/server-keys.js"

async function main() {
  const key = await getHDKey(process.env.SEED_PHRASE!)
  const firstKey = await getKeyByIndex(key, 0, true)

  const faucetAddress = await getTaprootAddress(firstKey)

  console.log({
    faucetAddress,
  })
}

main()
