import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  try {
    const d = new Date();
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: d, lte: d },
        branchId: "b"
      },
      include: {
        items: { include: { product: true } },
        cashier: true,
        branch: true
      },
      orderBy: { createdAt: "desc" }
    });
    console.log("Sales count:", sales.length);
  } catch(e) {
    console.error("Query Error:", e);
  }
}
main();
