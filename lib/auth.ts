import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
});

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}
export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword);
}
