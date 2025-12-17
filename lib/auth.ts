import NextAuth from "next-auth";
import credentials from "next-auth/providers/credentials";
import { signInSchema } from "./schema";

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
