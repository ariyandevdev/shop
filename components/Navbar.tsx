"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/theme-toggle";
import SearchInput from "./search-input";
import { getCategories } from "@/lib/actions";
import { CartCount } from "./CartCount";
import AuthStatus from "./Authstatus";

interface Category {
  name: string;
  slug: string;
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuOpen
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    {
      name: "Categories",
      href: "/search",
      submenu: categories.map((category) => ({
        name: category.name,
        href: `/search/${category.slug}`,
      })),
    },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.submenu ? (
                      <>
                        <NavigationMenuTrigger
                          className={cn(
                            "text-sm font-medium transition-all duration-200 hover:text-primary hover:bg-accent/50 rounded-md px-3 py-2",
                            item.name === "Categories" &&
                              pathname.startsWith("/search/") &&
                              pathname !== "/search" &&
                              "text-primary bg-accent/50"
                          )}
                        >
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.name}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={subItem.href}
                                    className={cn(
                                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-[1.02]",
                                      pathname === subItem.href &&
                                        "bg-accent text-accent-foreground font-medium"
                                    )}
                                  >
                                    <div className="text-sm font-medium leading-none">
                                      {subItem.name}
                                    </div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "group relative inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent/50 data-[state=open]:bg-accent/50 hover:scale-105 active:scale-95",
                            pathname === item.href &&
                              "bg-accent text-accent-foreground font-medium"
                          )}
                        >
                          {item.name}
                          {pathname === item.href && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                          )}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <SearchInput />
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {/* Desktop: Theme toggle, Cart, Auth */}
            <div className="hidden md:flex items-center gap-1">
              <div className="h-8 w-px bg-border mx-1" />
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="relative transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <CartCount />
                  <span className="sr-only">Shopping cart</span>
                </Link>
              </Button>
              <AuthStatus />
            </div>

            {/* Mobile: Search toggle or menu button */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative transition-all duration-200 hover:scale-110 active:scale-95"
                asChild
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <CartCount />
                  <span className="sr-only">Shopping cart</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          ref={mobileMenuRef}
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen
              ? "max-h-screen opacity-100 border-t border-border/40"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="py-4 space-y-4">
            {/* Mobile Search */}
            <div className="px-2 pb-4 border-b border-border/40">
              <SearchInput />
            </div>

            {/* Mobile Navigation Items */}
            <div className="flex flex-col space-y-1 px-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-sm font-semibold text-foreground/80">
                        {item.name}
                      </div>
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            "block px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200 active:scale-[0.98]",
                            pathname === subItem.href &&
                              "bg-accent text-foreground font-medium"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-2.5 text-sm font-medium hover:bg-accent rounded-md transition-all duration-200 active:scale-[0.98]",
                        pathname === item.href &&
                          "bg-accent text-foreground font-medium"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Auth Actions */}
            <div className="pt-4 border-t border-border/40 px-2">
              <div className="flex items-center justify-between">
                <AuthStatus />
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
