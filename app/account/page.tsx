import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/lib/account";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account - Shop",
  description: "Manage your account settings, profile information, and password. View your order history and account details.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/account");
  }

  const profileResult = await getUserProfile();

  if (!profileResult.success || !profileResult.user) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-lg text-muted-foreground">
              Failed to load profile. Please try again later.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const user = profileResult.user;
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your order history
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <Link href="/orders">
              <Button variant="outline" className="w-full sm:w-auto">
                <Package className="mr-2 h-4 w-4" />
                View My Orders
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account information and registration details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{user.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <ProfileForm initialData={{ name: user.name || "", email: user.email }} />

        <Separator />

        {/* Change Password Form */}
        <PasswordForm />
      </div>
    </main>
  );
}

