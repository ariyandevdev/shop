import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 10;

export async function NotificationsWidget() {
  const [outOfStockCount, lowStockCount, pendingOrders] = await Promise.all([
    prisma.product.count({
      where: {
        inventory: 0,
      },
    }),
    prisma.product.count({
      where: {
        inventory: {
          lte: LOW_STOCK_THRESHOLD,
          gt: 0,
        },
      },
    }),
    prisma.order.count({
      where: {
        status: "pending",
      },
    }),
  ]);

  const totalAlerts = outOfStockCount + lowStockCount + pendingOrders;

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <Link
      href="/admin/notifications"
      className="relative inline-flex items-center justify-center"
    >
      <Bell className="w-5 h-5" />
      {totalAlerts > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {totalAlerts > 99 ? "99+" : totalAlerts}
        </Badge>
      )}
    </Link>
  );
}

