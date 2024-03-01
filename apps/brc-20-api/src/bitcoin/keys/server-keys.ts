import { HDKey } from "@scure/bip32"
import * as bip39 from "@scure/bip39"
import { networkMode } from "./network.js"
import { getAddress } from "@scure/btc-signer"

export const getSegwitAddress = async (key: HDKey) => {
  return getAddress("wpkh", key.privateKey!, networkMode)
}

export const getTaprootAddress = async (key: HDKey) => {
  return getAddress("tr", key.privateKey!, networkMode)
}

export const getHDKey = async (mnemonic: string) => {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  return HDKey.fromMasterSeed(seed)
}

const getDerivationPath = async (keyIndex: number, taproot?: boolean) => {
  let accountIndex = 0
  if (keyIndex > 209_496_7296) {
    accountIndex = Math.floor(keyIndex / 209_496_7296)
  }

  const version = taproot ? 86 : 84
  const separator = "'/"
  const endQuote = "'"
  const path = ["m/", version, separator, 0, separator, accountIndex, endQuote]
  return path.join("")
}

export const getKeyByIndex = async (
  hdKey: HDKey,
  keyIndex: number,
  taproot?: boolean,
) => {
  const derivationPath = await getDerivationPath(keyIndex, taproot)
  return hdKey.derive(derivationPath).deriveChild(0).deriveChild(keyIndex)
}

export const getKeyForIndex = async (index: number, taproot?: boolean) => {
  const hdKey = await getHDKey(process.env.SEED_PHRASE!)

  return await getKeyByIndex(hdKey, index, taproot)
}
