import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  if (session.user.role !== "admin") {
    redirect("/");
  }
  
  return session;
}

