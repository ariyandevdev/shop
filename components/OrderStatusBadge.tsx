import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CreditCard,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const statusLower = status.toLowerCase();

  const getStatusConfig = () => {
    switch (statusLower) {
      case "pending":
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
          icon: Clock,
        };
      case "pending_payment":
        return {
          label: "Payment Pending",
          color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
          icon: CreditCard,
        };
      case "paid":
        return {
          label: "Paid",
          color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
          icon: CheckCircle2,
        };
      case "payment_processed":
        return {
          label: "Payment Processed",
          color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
          icon: CheckCircle2,
        };
      case "processing":
        return {
          label: "Processing",
          color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
          icon: Package,
        };
      case "shipped":
        return {
          label: "Shipped",
          color: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
          icon: Truck,
        };
      case "delivered":
      case "completed":
        return {
          label: statusLower === "delivered" ? "Delivered" : "Completed",
          color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
          icon: CheckCircle2,
        };
      case "cancelled":
      case "canceled":
        return {
          label: "Cancelled",
          color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
          icon: XCircle,
        };
      case "failed":
        return {
          label: "Failed",
          color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
          icon: AlertCircle,
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1",
        config.color,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

