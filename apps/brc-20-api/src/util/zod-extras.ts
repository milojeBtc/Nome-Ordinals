import {
  AddressType,
  getAddressInfo,
  validate,
} from "bitcoin-address-validation"
import { z } from "zod"

export const idSchema = z.number({
  description: "Unique ID of the object",
})

export const safeString = z
  .string({
    description: "String max 255 characters",
  })
  .max(255)

export const validBTCAddress = safeString
  .refine((value) => {
    return validate(value)
  })
  .describe("Valid BTC address")

export const validTaprootAddress = validBTCAddress
  .refine((value) => {
    return getAddressInfo(value).type === AddressType.p2tr
  })
  .describe("Valid taproot address")

export const validBuyAmount = z
  .number()
  .min(1000)
  .max(1_000_000)
  .refine((value) => {
    return value % 1000 === 0
  })
  .describe("Valid buy amount")

export const validFeeRate = z
  .number()
  .min(1)
  // crazy high fee rate, but it's a good boundary
  .max(50_000)
  .describe("Valid fee rate")
