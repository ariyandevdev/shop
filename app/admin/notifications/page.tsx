import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ShoppingCart,
  MessageSquare,
  Package,
  ArrowRight,
} from "lucide-react";

const LOW_STOCK_THRESHOLD = 10;

export default async function AdminNotificationsPage() {
  await requireAdmin();

  const [
    lowStockProducts,
    outOfStockCount,
    pendingOrders,
    newComments,
  ] = await Promise.all([
    prisma.product.findMany({
      where: {
        inventory: {
          lte: LOW_STOCK_THRESHOLD,
          gt: 0,
        },
      },
      take: 10,
      orderBy: {
        inventory: "asc",
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.product.count({
      where: {
        inventory: 0,
      },
    }),
    prisma.order.count({
      where: {
        status: "pending",
      },
    }),
    prisma.comment.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  const alerts = [
    {
      id: "out-of-stock",
      title: "Out of Stock Products",
      count: outOfStockCount,
      severity: "critical" as const,
      icon: AlertTriangle,
      href: "/admin/inventory?filter=out-of-stock",
      color: "text-destructive",
    },
    {
      id: "low-stock",
      title: "Low Stock Products",
      count: lowStockProducts.length,
      severity: "warning" as const,
      icon: Package,
      href: "/admin/inventory?filter=low-stock",
      color: "text-orange-600",
    },
    {
      id: "pending-orders",
      title: "Pending Orders",
      count: pendingOrders,
      severity: "info" as const,
      icon: ShoppingCart,
      href: "/admin/orders?status=pending",
      color: "text-blue-600",
    },
    {
      id: "new-comments",
      title: "New Comments (7 days)",
      count: newComments,
      severity: "info" as const,
      icon: MessageSquare,
      href: "/admin/comments",
      color: "text-purple-600",
    },
  ];

  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications & Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Monitor items requiring your attention
        </p>
      </div>

      {totalAlerts === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">All Clear!</h3>
                <p className="text-muted-foreground">
                  No alerts or notifications at this time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((alert) => {
            if (alert.count === 0) return null;

            const Icon = alert.icon;
            return (
              <Card
                key={alert.id}
                className={
                  alert.severity === "critical"
                    ? "border-destructive"
                    : alert.severity === "warning"
                    ? "border-orange-500"
                    : ""
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${alert.color}`} />
                      <span>{alert.title}</span>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : alert.severity === "warning"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {alert.count}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={alert.href}>
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Low Stock Products Detail */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded border"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-orange-600">
                      {product.inventory} left
                    </Badge>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/products/${product.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

