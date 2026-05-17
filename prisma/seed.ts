import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.upsert({
    where: { id: "default-branch" },
    update: {},
    create: {
      id: "default-branch",
      name: "Cabang Utama",
      address: "Jl. Utama No. 1",
      phone: "08123456789",
    },
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      email: "dmtshop20@gmail.com",
      name: "Admin Alfath",
      role: "ADMIN",
      branchId: branch.id,
      status: "Active",
    },
  });

  console.log({ branch, admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
