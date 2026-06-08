const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, stock: true, isFeatured: true, isBestSeller: true }
  });
  console.log(products);
}
check().finally(() => prisma.$disconnect());
