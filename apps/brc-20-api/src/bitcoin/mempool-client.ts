import mempoolJS from "@mempool/mempool.js"

const network = process.env.NETWORK_MODE === "mainnet" ? "" : "testnet"
export const mempoolClient = mempoolJS({
  hostname: "mempool.space",
  network,
})

export const postTx = async (txHash: string) => {
  const request = new Request(
    `https://mempool.space${network && "/testnet"}/api/tx`,
    {
      method: "POST",
      body: txHash,
    },
  )
  return fetch(request)
    .then((res) => res.text())
    .catch((err) => {
      console.error(err)
      throw err
    })
}
