import path from "node:path"
import { prisma } from "../prisma/client.js"
import { readFile } from "node:fs/promises"
type claimData = {
  ordinalAddress: string
  freeAmount?: number
}
async function insert(items: claimData[]) {
  await prisma.claim.deleteMany({
    where: {
      ordinalAddress: {
        in: items.map((item) => item.ordinalAddress),
      },
    },
  })
  await prisma.claim.createMany({
    data: items,
    skipDuplicates: true,
  })
}

function organizeCSVRows(rows: string[][]) {
  const result: claimData[] = []
  for (const row of rows) {
    const ordinalAddress = row[0].trim()

    let freeAmount
    if (row[1]) {
      freeAmount = parseInt(row[1])
    }
    result.push({
      ordinalAddress,
      freeAmount,
    })
  }
  return result
}

async function main() {
  const csvFilePath = process.argv[2]
  if (!csvFilePath) {
    console.error("Please provide a CSV file as the first argument")
    process.exit(1)
  }

  const fileData = (await readFile(path.resolve(csvFilePath)))
    .toString()
    .split("\n")
    .map((line) => line.split(",").slice(0, 2))

  const result = organizeCSVRows(fileData)
  await insert(result)
}

await main()
