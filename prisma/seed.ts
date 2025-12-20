import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  // Create sample users
  console.log("Creating users...");
  const users = [
    {
      email: "admin@example.com",
      name: "Admin User",
      password: "admin123",
      role: "admin",
    },
    {
      email: "user@example.com",
      name: "John Doe",
      password: "user123",
      role: "user",
    },
    {
      email: "jane.smith@example.com",
      name: "Jane Smith",
      password: "password123",
      role: "user",
    },
    {
      email: "test@example.com",
      name: "Test User",
      password: "test123",
      role: "user",
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
      },
    });
    console.log(`Created user: ${user.name} (${user.email}) - ${user.role}`);
  }

  console.log("Users created successfully!");

  // Create categories
  console.log("Creating categories...");

  const electronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics" },
  });

  const clothing = await prisma.category.create({
    data: { name: "Clothing", slug: "clothing" },
  });

  const home = await prisma.category.create({
    data: { name: "Home & Garden", slug: "home-garden" },
  });

  const sports = await prisma.category.create({
    data: { name: "Sports & Outdoors", slug: "sports-outdoors" },
  });

  console.log("Categories created");

  // Helper function to generate slug from name
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const products = [
    // Electronics (5 products)
    {
      name: "Wireless Bluetooth Headphones",
      description:
        "Premium noise-cancelling headphones with 30-hour battery life",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      categoryId: electronics.id,
      inventory: 50,
    },
    {
      name: "Smart Watch Pro",
      description: "Advanced fitness tracking with heart rate monitor and GPS",
      price: 299.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      categoryId: electronics.id,
      inventory: 30,
    },
    {
      name: "Portable Power Bank",
      description: "10000mAh fast-charging power bank",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1609091839311-d5365f5ff1f8?w=500",
      categoryId: electronics.id,
      inventory: 100,
    },
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with precision tracking",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
      categoryId: electronics.id,
      inventory: 75,
    },
    {
      name: "USB-C Hub",
      description: "Multi-port USB-C hub with HDMI and SD card reader",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500",
      categoryId: electronics.id,
      inventory: 60,
    },
    // Clothing (5 products)
    {
      name: "Classic Cotton T-Shirt",
      description: "Comfortable 100% organic cotton",
      price: 24.99,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      categoryId: clothing.id,
      inventory: 200,
    },
    {
      name: "Denim Jeans",
      description: "Classic fit denim jeans with stretch comfort",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1542272604-787c137553e3?w=500",
      categoryId: clothing.id,
      inventory: 150,
    },
    {
      name: "Winter Jacket",
      description: "Waterproof winter jacket with insulated lining",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
      categoryId: clothing.id,
      inventory: 80,
    },
    {
      name: "Running Shorts",
      description: "Lightweight moisture-wicking running shorts",
      price: 34.99,
      image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500",
      categoryId: clothing.id,
      inventory: 120,
    },
    {
      name: "Hooded Sweatshirt",
      description: "Comfortable cotton blend hoodie",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
      categoryId: clothing.id,
      inventory: 90,
    },
    // Home & Garden (4 products)
    {
      name: "Coffee Maker",
      description: "Programmable coffee maker with thermal carafe",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=500",
      categoryId: home.id,
      inventory: 40,
    },
    {
      name: "LED Desk Lamp",
      description: "Adjustable LED desk lamp with modern design",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1509223197845-458d87318791?w=500",
      categoryId: home.id,
      inventory: 70,
    },
    {
      name: "Throw Pillow Set",
      description: "Set of 2 decorative throw pillows",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1584100936595-3b8e3c0b5b8a?w=500",
      categoryId: home.id,
      inventory: 110,
    },
    {
      name: "Plant Pot Set",
      description: "Set of 3 ceramic plant pots with drainage",
      price: 44.99,
      image:
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500",
      categoryId: home.id,
      inventory: 85,
    },
    // Sports & Outdoors (4 products)
    {
      name: "Running Shoes",
      description: "Lightweight running shoes for ultimate comfort",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
      categoryId: sports.id,
      inventory: 65,
    },
    {
      name: "Yoga Mat",
      description: "Non-slip yoga mat with carrying strap",
      price: 34.99,
      image:
        "https://images.unsplash.com/photo-1601925260368-ae2f83d02bc4?w=500",
      categoryId: sports.id,
      inventory: 95,
    },
    {
      name: "Dumbbell Set",
      description: "Adjustable dumbbell set 5-25 lbs",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
      categoryId: sports.id,
      inventory: 45,
    },
    {
      name: "Water Bottle",
      description: "Insulated stainless steel water bottle 32oz",
      price: 24.99,
      image:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
      categoryId: sports.id,
      inventory: 130,
    },
  ];

  // Create products with slugs generated from names
  console.log("Creating products...");
  for (const product of products) {
    let slug = generateSlug(product.name);
    let counter = 1;

    // Ensure slug is unique
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${generateSlug(product.name)}-${counter}`;
      counter++;
    }

    await prisma.product.create({
      data: {
        ...product,
        slug,
      },
    });
    console.log(`Created product: ${product.name}`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - ${users.length} users created`);
  console.log(`   - 4 categories created`);
  console.log(`   - ${products.length} products created`);
  console.log("\n🔑 Sample User Credentials:");
  console.log("   Admin: admin@example.com / admin123");
  console.log("   User:  user@example.com / user123");
  console.log("   User:  jane.smith@example.com / password123");
  console.log("   User:  test@example.com / test123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
