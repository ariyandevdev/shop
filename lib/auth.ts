import NextAuth from "next-auth";
import credentials from "next-auth/providers/credentials";
import { RegisterSchema, RegisterSchemaType, signInSchema } from "./schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          throw new Error("Invalid credentials");
        }
        const { email, password } = parsedCredentials.data;
        try {
          // Dynamic import to avoid loading Prisma (which uses Node.js crypto) in Edge runtime
          const { prisma } = await import("./prisma");
          const user = await prisma.user.findUnique({
            where: { email },
          });
          if (!user) {
            throw new Error("Invalid credentials");
          }
          // Dynamic import to avoid loading bcrypt in Edge runtime
          const { comparePassword } = await import("./password");
          const passwordsMatch = await comparePassword(password, user.password);
          if (!passwordsMatch) {
            throw new Error("Invalid credentials");
          }
          return user;
        } catch (error) {
          // Optionally log error here
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        if ("name" in user) {
          token.name = user.name;
        }
        if ("role" in user) {
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.name =
          (token.name as string) || (token.email as string) || "";
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export async function registerUser(data: RegisterSchemaType) {
  const validationResult = RegisterSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid data provided.",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, password, name } = validationResult.data;

  try {
    // Dynamic import to avoid loading Prisma in Edge runtime
    const { prisma } = await import("./prisma");

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "A user with this email already exists.",
        issues: {
          email: ["This email is already registered."],
        },
      };
    }

    // Hash password before storing
    const { hashPassword } = await import("./password");
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "user", // Default role
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An error occurred while creating your account. Please try again.",
      issues: {},
    };
  }
}
