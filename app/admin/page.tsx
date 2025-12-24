import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import Charts from "@/components/Charts";

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span className="truncate">{stat.label}</span>
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color} shrink-0 ml-2`}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Charts />
    </div>
  );
}
