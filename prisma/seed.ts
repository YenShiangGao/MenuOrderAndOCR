import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "owner@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const owner = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: "Owner",
      role: "OWNER",
    },
  });

  console.log(`Seeded admin user: ${owner.email} / ${password}`);

  const categories = [
    { name: "主餐", sortOrder: 1 },
    { name: "小菜", sortOrder: 2 },
    { name: "飲料", sortOrder: 3 },
  ];

  for (const c of categories) {
    await prisma.menuCategory.upsert({
      where: { id: `seed-${c.name}` },
      update: {},
      create: { id: `seed-${c.name}`, ...c },
    });
  }

  console.log(`Seeded ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
