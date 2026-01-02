import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LOW_STOCK_THRESHOLD = 10;

export async function InventoryAlerts() {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      inventory: {
        lte: LOW_STOCK_THRESHOLD,
      },
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      inventory: "asc",
    },
    take: 10,
  });

  const outOfStockCount = await prisma.product.count({
    where: {
      inventory: 0,
    },
  });

  const lowStockCount = await prisma.product.count({
    where: {
      inventory: {
        lte: LOW_STOCK_THRESHOLD,
        gt: 0,
      },
    },
  });

  if (lowStockProducts.length === 0 && outOfStockCount === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <span>Inventory Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {outOfStockCount > 0 && (
                  <span className="text-destructive font-medium">
                    {outOfStockCount} out of stock
                  </span>
                )}
                {outOfStockCount > 0 && lowStockCount > 0 && " • "}
                {lowStockCount > 0 && (
                  <span className="text-orange-600 font-medium">
                    {lowStockCount} low stock
                  </span>
                )}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/inventory">View All</Link>
            </Button>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Low Stock Products:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 rounded bg-background border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.category.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span
                        className={`text-sm font-medium ${
                          product.inventory === 0
                            ? "text-destructive"
                            : "text-orange-600"
                        }`}
                      >
                        {product.inventory} left
                      </span>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/products/${product.id}`}>
                          <Package className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

