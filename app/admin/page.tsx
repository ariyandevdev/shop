import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import Charts from "@/components/Charts";
import { InventoryAlerts } from "@/components/InventoryAlerts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Shop",
  description: "Admin dashboard for managing products, orders, users, and store analytics.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboard() {
  await requireAdmin();

  // Fetch statistics
  const [totalProducts, totalOrders, totalUsers, revenueData] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelled" } },
      }),
    ]);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Total Revenue",
      value: `$${(revenueData._sum.total || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-orange-600",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stat.label}</span>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <InventoryAlerts />
      </div>

      <div className="mt-8">
        <Charts />
      </div>
    </div>
  );
}
