"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Tag,
  Image,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/sliders", label: "Sliders", icon: Image },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 lg:w-64 border-r bg-card min-h-screen transition-all duration-300">
      <div className="p-3 lg:p-6 border-b">
        <h2 className="text-lg lg:text-2xl font-bold hidden lg:block">
          Admin Panel
        </h2>
        <h2 className="text-lg font-bold lg:hidden text-center">A</h2>
      </div>
      <nav className="p-2 lg:p-4 space-y-1 lg:space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 px-2 lg:px-4 py-2 rounded-lg transition-colors group relative ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
              {/* Tooltip for mobile */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap lg:hidden">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
