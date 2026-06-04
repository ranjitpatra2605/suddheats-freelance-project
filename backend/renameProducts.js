const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const updates = [
    { old: 'Himalayan Flavour Makhana', new: 'Ghee Roasted Himalayan Flavour Makhana' },
    { old: 'Makhan Black Pepper Makhana', new: 'Ghee Roasted Black Pepper & Himalayan Flavour Makhana' },
    { old: 'Himalayan Salt Makhana', new: 'Cream & Onion Flavour Makhana' },
  ];

  for (const item of updates) {
    const existing = await prisma.product.findFirst({
      where: { name: { contains: item.old, mode: 'insensitive' } }
    });

    if (existing) {
      const slug = item.new.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      console.log(`Updating '${existing.name}' to '${item.new}'`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.new,
          slug: slug
        }
      });
    } else {
      console.log(`Could not find product matching '${item.old}'`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
