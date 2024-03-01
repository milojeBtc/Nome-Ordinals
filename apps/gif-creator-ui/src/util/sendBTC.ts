import {
  BitcoinNetworkType,
  SendBtcTransactionOptions,
  sendBtcTransaction,
} from "sats-connect";

export function sendBTC({
  address,
  amount,
  network,
  paymentAddress,
}: {
  address: string;
  amount: number;
  paymentAddress: string;
  network: BitcoinNetworkType;
}) {
  return new Promise<string>((resolve, reject) => {
    const sendBtcOptions: SendBtcTransactionOptions = {
      payload: {
        network: {
          type: network,
        },
        recipients: [
          {
            address: address,
            amountSats: BigInt(amount),
          },
        ],
        senderAddress: paymentAddress,
      },
      onFinish: (response) => {
        resolve(response);
      },
      onCancel: reject,
    };
    return sendBtcTransaction(sendBtcOptions);
  });
}
