import { prisma } from "../prisma/client.js"

async function main() {
  const allClaims = await prisma.claim.findMany({})

  for (const claim of allClaims) {
    const dupes = await prisma.claim.findMany({
      where: {
        ordinalAddress: claim.ordinalAddress,
      },
      orderBy: {
        freeAmount: "desc",
      },
    })
    const [_keeper, ...rest] = dupes
    for (const dupe of rest) {
      await prisma.claim.delete({
        where: {
          id: dupe.id,
        },
      })
    }
  }
}

await main()
