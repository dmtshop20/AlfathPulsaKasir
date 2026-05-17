import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.dir(users, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
