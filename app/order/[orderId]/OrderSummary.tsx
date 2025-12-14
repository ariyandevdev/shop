import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Prisma } from "@prisma/client";

type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: {
    product: true;
  };
}>;

interface OrderSummaryProps {
  items: OrderItemWithProduct[];
  total: number;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({totalItems} items)
            </span>
            <span className="font-medium">{formatPrice(total)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

