const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const updates = [
    { 
      name: 'Ghee Roasted Black Pepper & Himalayan Flavour Makhana', 
      image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563580/shuddheats/products/black-pepper-makhana.jpg' 
    },
    { 
      name: 'Ghee Roasted Himalayan Flavour Makhana', 
      image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563155/shuddheats/products/g6ywkxtwwsztpzcfcsok.jpg' 
    }
  ];

  for (const item of updates) {
    const existing = await prisma.product.findFirst({
      where: { name: item.name }
    });

    if (existing) {
      console.log(`Updating images for '${existing.name}'`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          images: JSON.stringify([item.image]),
          thumbnail: item.image
        }
      });
    } else {
      console.log(`Could not find product matching '${item.name}'`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
