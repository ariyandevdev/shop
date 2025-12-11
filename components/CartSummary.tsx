import { getCart } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const CartSummary = async () => {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 md:mt-8">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Order Summary</h2>
        <Separator className="mb-6" />
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm md:text-base">
            <span className="text-muted-foreground">Items ({cart.size})</span>
            <span className="font-medium">{formatPrice(cart.subtotal)}</span>
          </div>
        </div>
        <Separator className="mb-6" />
        <div className="flex justify-between text-lg md:text-xl font-bold mb-6">
          <span>Total</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CartSummary;
