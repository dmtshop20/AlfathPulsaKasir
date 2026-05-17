import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Create Default Branch
  const branch = await prisma.branch.upsert({
    where: { id: "default-branch-id" }, // Using a fixed ID for seeding reliability
    update: {},
    create: {
      id: "default-branch-id",
      name: "Pusat",
      address: "Jl. Utama No. 1",
      phone: "08123456789"
    }
  });

  console.log("Created branch:", branch.name);

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Super Admin",
      role: "ADMIN",
      branchId: branch.id,
      status: "Active"
    }
  });

  console.log("Created admin user: admin / admin123");

  // Create a Cashier for testing
  const cashierPassword = await bcrypt.hash("cashier123", 10);
  await prisma.user.upsert({
    where: { username: "cashier" },
    update: {},
    create: {
      username: "cashier",
      password: cashierPassword,
      name: "Kasir Toko",
      role: "CASHIER",
      branchId: branch.id,
      status: "Active"
    }
  });

  console.log("Created cashier user: cashier / cashier123");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
