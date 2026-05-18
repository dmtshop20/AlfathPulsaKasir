import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("All users:");
  for (const user of users) {
    const isMatchAdmin = await bcrypt.compare('admin', user.password);
    const isMatchAdmin123 = await bcrypt.compare('admin123', user.password);
    console.log(`- ${user.username} | ${user.role} | PwdHash: ${user.password} | match(admin): ${isMatchAdmin} | match(admin123): ${isMatchAdmin123}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
