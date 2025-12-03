import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  console.log("Starting seed...");

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

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

  const products = [
    {
      name: "Wireless Bluetooth Headphones",
      description:
        "Premium noise-cancelling headphones with 30-hour battery life",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      categoryId: electronics.id,
    },
    {
      name: "Smart Watch Pro",
      description: "Advanced fitness tracking with heart rate monitor and GPS",
      price: 299.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      categoryId: electronics.id,
    },
    {
      name: "Portable Power Bank",
      description: "10000mAh fast-charging power bank",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1609091839311-d5365f5ff1f8?w=500",
      categoryId: electronics.id,
    },

    {
      name: "Classic Cotton T-Shirt",
      description: "Comfortable 100% organic cotton",
      price: 24.99,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      categoryId: clothing.id,
    },
  ];

  await prisma.product.createMany({ data: products });

  console.log("Seed completed successfully!");
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
