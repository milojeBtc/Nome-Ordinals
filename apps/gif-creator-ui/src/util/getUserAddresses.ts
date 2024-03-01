import { network } from "../constants/bitcoin.ts";
import { AddressPurpose, getAddress } from "sats-connect";

/**
 *
 * @returns {Promise<import("sats-connect").GetAddressResponse>}
 */
export const getUserAddresses = () => {
  return new Promise((resolve, reject) => {
    getAddress({
      payload: {
        message:
          "Select the address you will use to pay for the service and the address which will receive ordinals.",
        network: {
          type: network,
        },
        purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
      },
      onCancel: () => {
        reject("User cancelled");
      },
      onFinish: (addresses) => {
        resolve(addresses);
      },
    });
  });
};
