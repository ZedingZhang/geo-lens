// Demo data cleanup script
// Usage: npx tsx scripts/cleanup-demo.ts

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const now = new Date();
  console.log(`Running demo cleanup at ${now.toISOString()}...`);

  const expired = await prisma.project.findMany({
    where: {
      isSample: false,
      expiresAt: { lt: now },
    },
    select: { id: true, name: true, brandName: true },
  });

  if (expired.length === 0) {
    console.log("No expired demo projects found.");
    return;
  }

  console.log(`Found ${expired.length} expired demo projects:`);
  for (const p of expired) {
    console.log(`  - ${p.name} (${p.brandName})`);
  }

  const ids = expired.map((p) => p.id);
  await prisma.project.deleteMany({ where: { id: { in: ids } } });

  console.log(`Deleted ${expired.length} projects.`);
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
