const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockProducts = [
  {
    name: "Himalayan Salt Makhana",
    slug: "himalayan-salt-makhana",
    description: "Light, airy fox nuts air-popped and seasoned with pure Himalayan pink salt. High in protein, low in fat, and completely guilt-free. Perfect for evening snacking.",
    shortDescription: "Air-popped fox nuts with Himalayan pink salt.",
    price: 249,
    originalPrice: 299,
    category: "Flavoured Makhanas",
    thumbnail: "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg",
    images: ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg"],
    stock: 150,
    weight: "100g",
    ingredients: ["Fox Nuts (Makhana)", "Himalayan Pink Salt", "Cold Pressed Coconut Oil"],
    nutritionFacts: { calories: 347, protein: 9.7, carbs: 76.9, fat: 0.1, fiber: 0.5 },
    tags: ["makhana", "healthy", "low-fat", "himalayan-salt"],
    isFeatured: true,
    isBestSeller: true,
    ratings: 4.8,
    numReviews: 124
  },
  {
    name: "Peri Peri Makhana",
    slug: "peri-peri-makhana",
    description: "Spicy and tangy peri peri flavoured makhana. Boldly seasoned with African spices for those who love a kick. Air-popped, never fried.",
    shortDescription: "Spicy peri peri flavoured fox nuts.",
    price: 249,
    originalPrice: 299,
    category: "Flavoured Makhanas",
    thumbnail: "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563589/shuddheats/products/peri-peri-makhana.jpg",
    images: ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563589/shuddheats/products/peri-peri-makhana.jpg"],
    stock: 110,
    weight: "100g",
    ingredients: ["Fox Nuts (Makhana)", "Peri Peri Seasoning", "Salt", "Sunflower Oil"],
    nutritionFacts: { calories: 347, protein: 10, carbs: 76.9, fat: 0.28, fiber: 0.5 },
    tags: ["makhana", "peri-peri", "savory"],
    isFeatured: true,
    isBestSeller: true,
    ratings: 4.7,
    numReviews: 92
  },
  {
    name: "Beetroot Chips",
    slug: "beetroot-chips",
    description: "Crispy air-fried beetroot chips with just the right amount of salt. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
    shortDescription: "Air fried beetroot chips with minimal oil.",
    price: 129,
    originalPrice: 169,
    category: "Air Fried Chips",
    thumbnail: "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563579/shuddheats/products/beetroot-chips.jpg",
    images: ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563579/shuddheats/products/beetroot-chips.jpg"],
    stock: 145,
    weight: "100g",
    ingredients: ["Beetroot", "Salt", "Sunflower Oil (minimal)"],
    nutritionFacts: { calories: 130, protein: 2.1, carbs: 27.8, fat: 2.0, fiber: 2.2 },
    tags: ["chips", "beetroot", "air-fried", "healthy", "low-fat"],
    isFeatured: true,
    isBestSeller: true,
    ratings: 4.7,
    numReviews: 112
  },
  {
    name: "Honey & Oats Cookies",
    slug: "honey-oats-cookies",
    description: "Delicious and nutritious honey and oats cookies with absolutely no added sugar or palm oil.",
    shortDescription: "Nutritious honey oats cookies, zero sugar, no palm oil.",
    price: 149,
    originalPrice: 199,
    category: "No Sugar No Palm Oil Millet Cookies",
    thumbnail: "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563586/shuddheats/products/honey-oats-cookies.jpg",
    images: ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563586/shuddheats/products/honey-oats-cookies.jpg"],
    stock: 120,
    weight: "100g",
    ingredients: ["Oats", "Honey", "Coconut Oil", "Sea Salt", "Baking Powder"],
    nutritionFacts: { calories: 410, protein: 8.2, carbs: 62.3, fat: 14.5, fiber: 3.1 },
    tags: ["cookies", "oats", "honey", "no-sugar", "no-palm-oil", "healthy"],
    isFeatured: true,
    isBestSeller: true,
    ratings: 4.9,
    numReviews: 134
  }
];

async function main() {
  console.log('Seeding database with mock products...');
  for (const product of mockProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`Created/Updated product: ${product.name}`);
  }
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
