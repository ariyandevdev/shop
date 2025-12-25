import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Shop",
  description: "Sign in or create an account to access your profile, orders, and shopping cart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

