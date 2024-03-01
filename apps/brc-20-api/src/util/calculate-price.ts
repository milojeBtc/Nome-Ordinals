import {
  BASE_POSTAGE,
  INSCRIPTION_WEIGHT,
  TRANSFER_WEIGHT,
} from "../constants.js"

export const calculatePrice = ({
  feeRate,
  amount,
  price = 0,
  freeAmount = 0,
}: {
  feeRate: number
  amount: number
  price?: number
  freeAmount?: number
}) => {
  const minerFees = feeRate * (TRANSFER_WEIGHT + INSCRIPTION_WEIGHT)
  const brc20Price = Math.ceil(
    (price * Math.max(amount - freeAmount, 0)) / 1000,
  )
  return {
    brc20Price,
    minerFees,
    basePostage: BASE_POSTAGE,
    total: minerFees + brc20Price + BASE_POSTAGE,
  }
}
