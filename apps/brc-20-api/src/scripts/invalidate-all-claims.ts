import { prisma } from "../prisma/client.js"

let claims = await prisma.claim.findMany({
  where: {
    freeAmount: {
      gt: 0,
    },
    claimedAmount: 0,
  },
  include: {
    orders: true,
  },
})

claims = claims.filter((claim) => claim.orders.length === 0)

console.log(`Deleting ${claims.length} claims`)
for (const claim of claims) {
  if (claim.orders.length === 0) {
    await prisma.claim.delete({
      where: {
        id: claim.id,
      },
    })
  }
}
