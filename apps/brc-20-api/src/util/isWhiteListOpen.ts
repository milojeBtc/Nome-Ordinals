export const WL_EXPIRATION_DATE_TIME = new Date("2023-12-27T22:00:00Z")
export async function isWhitelistOpen() {
  return new Date() < WL_EXPIRATION_DATE_TIME
}
