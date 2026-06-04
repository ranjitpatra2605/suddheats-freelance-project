const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requiredProducts = [
  { name: 'Broccoli Chips', price: 99, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/broccoli-chips.jpg' },
  { name: 'Ragi Chips – Himalayan Flavour', price: 99, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/ragi-chips.jpg' },
  { name: 'Makhan Black Pepper Makhana', price: 149, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/makhana-black-pepper.jpg' },
  { name: 'Himalayan Flavour Makhana', price: 149, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/makhana-himalayan.jpg' },
  { name: 'Ragi & Elaichi Cookies', price: 199, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563570/shuddheats/assets/ragi-cookies.jpg' },
  { name: 'Jowar & Nuts Cookies', price: 199, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563568/shuddheats/assets/jowar-cookies.jpg' }
];

async function run() {
  for (const p of requiredProducts) {
    // Generate slug
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if exists
    let existing = await prisma.product.findFirst({
      where: {
        OR: [
          { name: p.name },
          { slug: slug },
        ]
      }
    });
    
    if (existing) {
      console.log(`Updating existing: ${p.name}`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          isFeatured: true,
          isBestSeller: true,
          stock: existing.stock > 0 ? existing.stock : 100,
          name: p.name, // Ensure exact name match
          slug: slug
        }
      });
    } else {
      console.log(`Creating new: ${p.name}`);
      await prisma.product.create({
        data: {
          name: p.name,
          slug: slug,
          description: `Delicious and healthy ${p.name}`,
          price: p.price,
          category: p.name.includes('Makhana') ? 'Makhana' : p.name.includes('Chips') ? 'Chips' : 'Cookies',
          images: JSON.stringify([p.image]),
          thumbnail: p.image,
          stock: 100,
          isFeatured: true,
          isBestSeller: true,
          ratings: 5,
          numReviews: 1
        }
      });
    }
  }
  console.log('Done syncing products');
}

run().catch(console.error).finally(() => prisma.$disconnect());
