"use client";

import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { LogIn, User, Package } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthStatus() {
  const { status, data: session } = useSession();

  if (status === "loading") {
    return <Skeleton className="w-9 h-9 animate-pulse" />;
  }

  if (status === "unauthenticated") {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/auth/signin">
          <LogIn className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{session?.user?.name || session?.user?.email || "User"}</span>
            {session?.user?.role && (
              <span className="text-xs text-muted-foreground font-normal capitalize">
                {session.user.role}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
