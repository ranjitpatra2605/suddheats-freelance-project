const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockProducts = [
  {
    "name": "Himalayan Salt Makhana",
    "slug": "himalayan-salt-makhana",
    "description": "Light, airy fox nuts air-popped and seasoned with pure Himalayan pink salt. High in protein, low in fat, and completely guilt-free. Perfect for evening snacking.",
    "shortDescription": "Air-popped fox nuts with Himalayan pink salt.",
    "price": 249,
    "originalPrice": 299,
    "category": "Flavoured Makhanas",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg"
    ],
    "stock": 150,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Himalayan Pink Salt",
      "Cold Pressed Coconut Oil"
    ],
    "nutritionFacts": {
      "calories": 347,
      "protein": 9.7,
      "carbs": 76.9,
      "fat": 0.1,
      "fiber": 0.5
    },
    "tags": [
      "makhana",
      "healthy",
      "low-fat",
      "himalayan-salt"
    ],
    "isFeatured": true,
    "isBestSeller": true,
    "ratings": 4.8,
    "numReviews": 124
  },
  {
    "name": "Black Pepper & Himalayan Salt Makhana",
    "slug": "black-pepper-makhana",
    "description": "Boldly seasoned with black pepper and Himalayan pink salt. Air-popped, never fried.",
    "shortDescription": "Spicy black pepper flavoured fox nuts.",
    "price": 249,
    "originalPrice": 299,
    "category": "Flavoured Makhanas",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563580/shuddheats/products/black-pepper-makhana.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563580/shuddheats/products/black-pepper-makhana.jpg"
    ],
    "stock": 120,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Black Pepper Seasoning",
      "Sunflower Oil",
      "Salt"
    ],
    "nutritionFacts": {
      "calories": 355,
      "protein": 9.5,
      "carbs": 74.2,
      "fat": 2.1,
      "fiber": 0.5
    },
    "tags": [
      "makhana",
      "spicy",
      "black-pepper"
    ],
    "isFeatured": false,
    "isBestSeller": false,
    "ratings": 4.6,
    "numReviews": 89
  },
  {
    "name": "Pudina Makhana",
    "slug": "pudina-makhana",
    "description": "Refreshing mint flavored makhana with aromatic pudina seasoning. Light, cooling, and perfect as an afternoon snack.",
    "shortDescription": "Refreshing mint flavored fox nuts.",
    "price": 249,
    "originalPrice": 299,
    "category": "Flavoured Makhanas",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563590/shuddheats/products/pudina-makhana.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563590/shuddheats/products/pudina-makhana.jpg"
    ],
    "stock": 100,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Pudina (Mint) Seasoning",
      "Salt",
      "Cold Pressed Oil"
    ],
    "nutritionFacts": {
      "calories": 347,
      "protein": 9.7,
      "carbs": 76.9,
      "fat": 0.13,
      "fiber": 0.5
    },
    "tags": [
      "makhana",
      "pudina",
      "mint"
    ],
    "isFeatured": false,
    "isBestSeller": false,
    "ratings": 4.5,
    "numReviews": 65
  },
  {
    "name": "Peri Peri Makhana",
    "slug": "peri-peri-makhana",
    "description": "Spicy and tangy peri peri flavoured makhana. Boldly seasoned with African spices for those who love a kick. Air-popped, never fried.",
    "shortDescription": "Spicy peri peri flavoured fox nuts.",
    "price": 249,
    "originalPrice": 299,
    "category": "Flavoured Makhanas",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563589/shuddheats/products/peri-peri-makhana.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563589/shuddheats/products/peri-peri-makhana.jpg"
    ],
    "stock": 110,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Peri Peri Seasoning",
      "Salt",
      "Sunflower Oil"
    ],
    "nutritionFacts": {
      "calories": 347,
      "protein": 10,
      "carbs": 76.9,
      "fat": 0.28,
      "fiber": 0.5
    },
    "tags": [
      "makhana",
      "peri-peri",
      "savory"
    ],
    "isFeatured": false,
    "isBestSeller": true,
    "ratings": 4.7,
    "numReviews": 92
  },
  {
    "name": "Cream & Onion Makhana",
    "slug": "cream-onion-makhana",
    "description": "Decadent cream and onion flavor meets light, crispy makhana. A sophisticated snack for those who prefer refined taste.",
    "shortDescription": "Rich cream and onion flavored fox nuts.",
    "price": 249,
    "originalPrice": 299,
    "category": "Flavoured Makhanas",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563584/shuddheats/products/cream-onion-makhana.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563584/shuddheats/products/cream-onion-makhana.jpg"
    ],
    "stock": 95,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Cream and Onion Flavoring",
      "Salt",
      "Sunflower Oil"
    ],
    "nutritionFacts": {
      "calories": 347,
      "protein": 9.7,
      "carbs": 76.9,
      "fat": 0.23,
      "fiber": 0.5
    },
    "tags": [
      "makhana",
      "cream-onion",
      "premium"
    ],
    "isFeatured": false,
    "isBestSeller": false,
    "ratings": 4.6,
    "numReviews": 75
  },
  {
    "name": "Beetroot Chips",
    "slug": "beetroot-chips",
    "description": "Crispy air-fried beetroot chips with just the right amount of salt. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
    "shortDescription": "Air fried beetroot chips with minimal oil.",
    "price": 129,
    "originalPrice": 169,
    "category": "Air Fried Chips",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563579/shuddheats/products/beetroot-chips.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563579/shuddheats/products/beetroot-chips.jpg"
    ],
    "stock": 145,
    "weight": "100g",
    "ingredients": [
      "Beetroot",
      "Salt",
      "Sunflower Oil (minimal)"
    ],
    "nutritionFacts": {
      "calories": 130,
      "protein": 2.1,
      "carbs": 27.8,
      "fat": 2,
      "fiber": 2.2
    },
    "tags": [
      "chips",
      "beetroot",
      "air-fried",
      "healthy",
      "low-fat"
    ],
    "isFeatured": true,
    "isBestSeller": true,
    "ratings": 4.7,
    "numReviews": 112
  },
  {
    "name": "Broccoli Chips",
    "slug": "broccoli-chips",
    "description": "Flavorful broccoli air-fried chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
    "shortDescription": "Broccoli air-fried chips with minimal oil.",
    "price": 129,
    "originalPrice": 169,
    "category": "Air Fried Chips",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563581/shuddheats/products/broccoli-chips.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563581/shuddheats/products/broccoli-chips.jpg"
    ],
    "stock": 135,
    "weight": "100g",
    "ingredients": [
      "Broccoli",
      "Spices",
      "Salt",
      "Sunflower Oil (minimal)"
    ],
    "nutritionFacts": {
      "calories": 140,
      "protein": 2.3,
      "carbs": 28.5,
      "fat": 2.2,
      "fiber": 2.4
    },
    "tags": [
      "chips",
      "broccoli",
      "air-fried",
      "healthy",
      "low-fat"
    ],
    "isFeatured": false,
    "isBestSeller": true,
    "ratings": 4.8,
    "numReviews": 98
  },
  {
    "name": "Ragi Chips",
    "slug": "ragi-chips",
    "description": "Perfectly salted and crispy air-fried ragi chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
    "shortDescription": "Salted air-fried ragi chips with minimal oil.",
    "price": 129,
    "originalPrice": 169,
    "category": "Air Fried Chips",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563591/shuddheats/products/ragi-chips.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563591/shuddheats/products/ragi-chips.jpg"
    ],
    "stock": 125,
    "weight": "100g",
    "ingredients": [
      "Ragi",
      "Sea Salt",
      "Sunflower Oil (minimal)"
    ],
    "nutritionFacts": {
      "calories": 130,
      "protein": 2.1,
      "carbs": 27.8,
      "fat": 2,
      "fiber": 2.2
    },
    "tags": [
      "chips",
      "ragi",
      "air-fried",
      "healthy",
      "low-fat"
    ],
    "isFeatured": false,
    "isBestSeller": false,
    "ratings": 4.6,
    "numReviews": 87
  },
  {
    "name": "Honey & Oats Cookies",
    "slug": "honey-oats-cookies",
    "description": "Delicious and nutritious honey and oats cookies with absolutely no added sugar or palm oil.",
    "shortDescription": "Nutritious honey oats cookies, zero sugar, no palm oil.",
    "price": 149,
    "originalPrice": 199,
    "category": "No Sugar No Palm Oil Millet Cookies",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563586/shuddheats/products/honey-oats-cookies.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563586/shuddheats/products/honey-oats-cookies.jpg"
    ],
    "stock": 120,
    "weight": "100g",
    "ingredients": [
      "Oats",
      "Honey",
      "Coconut Oil",
      "Sea Salt",
      "Baking Powder"
    ],
    "nutritionFacts": {
      "calories": 410,
      "protein": 8.2,
      "carbs": 62.3,
      "fat": 14.5,
      "fiber": 3.1
    },
    "tags": [
      "cookies",
      "oats",
      "honey",
      "no-sugar",
      "no-palm-oil",
      "healthy"
    ],
    "isFeatured": true,
    "isBestSeller": true,
    "ratings": 4.9,
    "numReviews": 134
  },
  {
    "name": "Jowar & Nuts Cookies",
    "slug": "jowar-nuts-cookies",
    "description": "Delicious and nutritious jowar and nuts cookies with absolutely no added sugar or palm oil.",
    "shortDescription": "Nutritious jowar and nuts cookies, zero sugar, no palm oil.",
    "price": 149,
    "originalPrice": 199,
    "category": "No Sugar No Palm Oil Millet Cookies",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563587/shuddheats/products/jowar-nuts-cookies.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563587/shuddheats/products/jowar-nuts-cookies.jpg"
    ],
    "stock": 115,
    "weight": "100g",
    "ingredients": [
      "Jowar Flour",
      "Nuts",
      "Natural Sweetener (Stevia)",
      "Coconut Oil",
      "Sea Salt",
      "Baking Powder"
    ],
    "nutritionFacts": {
      "calories": 410,
      "protein": 8.2,
      "carbs": 62.3,
      "fat": 14.5,
      "fiber": 3.1
    },
    "tags": [
      "cookies",
      "jowar",
      "nuts",
      "no-sugar",
      "no-palm-oil",
      "healthy"
    ],
    "isFeatured": false,
    "isBestSeller": true,
    "ratings": 4.8,
    "numReviews": 110
  },
  {
    "name": "Ragi & Elaichi Cookies",
    "slug": "ragi-elaichi-cookies",
    "description": "Delicious and nutritious ragi and elaichi cookies with absolutely no added sugar or palm oil.",
    "shortDescription": "Nutritious ragi and elaichi cookies, zero sugar, no palm oil.",
    "price": 149,
    "originalPrice": 199,
    "category": "No Sugar No Palm Oil Millet Cookies",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563592/shuddheats/products/ragi-elaichi-cookies.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563592/shuddheats/products/ragi-elaichi-cookies.jpg"
    ],
    "stock": 125,
    "weight": "100g",
    "ingredients": [
      "Ragi Flour",
      "Elaichi",
      "Natural Sweetener (Stevia)",
      "Coconut Oil",
      "Sea Salt",
      "Baking Powder"
    ],
    "nutritionFacts": {
      "calories": 410,
      "protein": 8.2,
      "carbs": 62.3,
      "fat": 14.5,
      "fiber": 3.1
    },
    "tags": [
      "cookies",
      "ragi",
      "elaichi",
      "no-sugar",
      "no-palm-oil",
      "healthy"
    ],
    "isFeatured": false,
    "isBestSeller": true,
    "ratings": 4.7,
    "numReviews": 98
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

  console.log('Checking for admin user...');
  const bcrypt = require("bcryptjs");
  const adminEmail = "admin@shuddheats.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        is2FAEnabled: false,
      },
    });
    console.log("✅ Admin user created");
  } else {
    // Ensure existing admin has the correct role
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      });
      console.log("✅ Admin user role updated to ADMIN");
    } else {
      console.log("ℹ️ Admin already exists and has correct role");
    }
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
