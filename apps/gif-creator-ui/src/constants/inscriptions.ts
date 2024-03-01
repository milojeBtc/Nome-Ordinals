export enum OrderingState {
  None,
  RequestingWalletAddress,
  WaitingForCreation,
  WaitingForPayment,
}

export type CompressAble = {
  original: File;
  compressed: File;
  duration: number;
};
