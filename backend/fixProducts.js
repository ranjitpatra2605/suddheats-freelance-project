const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.product.count();
  console.log('Count:', count);
  await prisma.$executeRaw`UPDATE "products" SET "is_featured" = true WHERE "is_featured" = false OR "is_featured" IS NULL`;
  await prisma.$executeRaw`UPDATE "products" SET "is_best_seller" = true WHERE "is_best_seller" = false OR "is_best_seller" IS NULL`;
  console.log('Updated flags');
}
check().catch(console.error).finally(() => prisma.$disconnect());
