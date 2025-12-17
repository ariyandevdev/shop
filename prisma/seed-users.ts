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
  console.log("Starting user seed...");

  await prisma.user.deleteMany();

  // Create sample users
  const users = [
    {
      email: "admin@example.com",
      name: "Admin User",
      password: "admin123",
      role: "admin",
    },
    {
      email: "user@example.com",
      name: "Regular User",
      password: "user123",
      role: "user",
    },
    {
      email: "john.doe@example.com",
      name: "John Doe",
      password: "password123",
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

  console.log("User seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during user seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
