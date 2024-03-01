import { GetAddressResponse } from "sats-connect";

export function getWalletAddresses(response: GetAddressResponse) {
  let ordinalAddress = "";
  let paymentAddress = "";
  response.addresses.forEach((item) => {
    if (item.purpose == "ordinals") {
      ordinalAddress = item.address;
    } else if (item.purpose == "payment") {
      paymentAddress = item.address;
    }
  });

  return {
    ordinalAddress,
    paymentAddress,
  };
}
