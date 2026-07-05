const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shuddheats.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@shuddheats.com',
      password: adminPassword,
      role: 'admin',
      phone: '1234567890',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Clear existing products to avoid slug collisions during seed
  await prisma.product.deleteMany({});
  console.log('✅ Cleared old products');

  // 3. Create Sample Products
  const products = [
    {
      name: 'Himalayan Pink Salt Makhana',
      slug: 'himalayan-pink-salt-makhana',
      description: 'Premium roasted fox nuts tossed in organic Himalayan pink salt. The perfect guilt-free snack for your everyday cravings. Roasted with cold-pressed olive oil to preserve all nutrients while giving you that perfect crunch.',
      shortDescription: 'Classic roasted makhana with Himalayan salt.',
      price: 150,
      originalPrice: 199,
      category: 'Flavoured Makhanas',
      images: [
        'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/makhana-bundel.jpg'
      ],
      thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/makhana-bundel.jpg',
      stock: 100,
      weight: '75gm',
      ingredients: ['Fox Nuts (Makhana)', 'Cold Pressed Olive Oil', 'Himalayan Pink Salt'],
      tags: ['healthy', 'vegan', 'gluten-free'],
      isFeatured: true,
      isBestSeller: true,
      ratings: 4.8,
      numReviews: 124,
    },
    {
      name: 'Peri Peri Roasted Makhana',
      slug: 'peri-peri-roasted-makhana',
      description: 'Spicy, tangy, and absolutely addictive! Our Peri Peri Makhana is roasted to perfection and coated with our secret spice blend.',
      shortDescription: 'Spicy and tangy peri peri makhana.',
      price: 165,
      originalPrice: 210,
      category: 'Flavoured Makhanas',
      images: [
        'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/makhana-bundel.jpg'
      ],
      thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/makhana-bundel.jpg',
      stock: 85,
      weight: '75gm',
      ingredients: ['Fox Nuts (Makhana)', 'Cold Pressed Olive Oil', 'Peri Peri Spice Mix'],
      tags: ['spicy', 'vegan', 'gluten-free'],
      isFeatured: true,
      isBestSeller: true,
      ratings: 4.9,
      numReviews: 89,
    },
    {
      name: 'Beetroot Chips',
      slug: 'beetroot-chips',
      description: 'Air-fried beetroot chips with 70% less oil. Earthy, crunchy, and packed with fibre and antioxidants.',
      shortDescription: 'Air-fried crispy beetroot chips.',
      price: 120,
      originalPrice: 150,
      category: 'Air Fried Chips',
      images: [
        'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563567/shuddheats/assets/beetroot-chips.jpg'
      ],
      thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563567/shuddheats/assets/beetroot-chips.jpg',
      stock: 120,
      weight: '100gm',
      ingredients: ['Real Beetroot', 'Sunflower Oil (Trace amounts)', 'Salt'],
      tags: ['air-fried', 'low-calorie'],
      isFeatured: true,
      isBestSeller: false,
      ratings: 4.6,
      numReviews: 45,
    },
    {
      name: 'Jowar & Nuts Cookies',
      slug: 'jowar-nuts-cookies',
      description: 'Wholesome Jowar (Sorghum) cookies loaded with premium nuts. Zero refined sugar, zero palm oil. Sweetened naturally.',
      shortDescription: 'Healthy jowar cookies with nuts.',
      price: 180,
      originalPrice: 220,
      category: 'No Sugar No Palm Oil Millet Cookies',
      images: [
        'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563568/shuddheats/assets/jowar-cookies.jpg'
      ],
      thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563568/shuddheats/assets/jowar-cookies.jpg',
      stock: 60,
      weight: '100gm',
      ingredients: ['Jowar Flour', 'Almonds', 'Cashews', 'Jaggery', 'Butter'],
      tags: ['millet', 'no-sugar', 'no-palm-oil'],
      isFeatured: true,
      isBestSeller: true,
      ratings: 4.9,
      numReviews: 210,
    }
  ];

  for (const p of products) {
    const created = await prisma.product.create({
      data: p
    });
    console.log(`✅ Created product: ${created.name}`);
  }

  console.log('🎉 Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
