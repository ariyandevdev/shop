import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";

type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: {
    product: true;
  };
}>;

interface OrderItemsProps {
  items: OrderItemWithProduct[];
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Order Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const productPrice =
              typeof item.product.price === "object" &&
              item.product.price !== null
                ? Number(item.product.price)
                : typeof item.product.price === "number"
                ? item.product.price
                : item.price;
            const itemTotal = productPrice * item.quantity;

            return (
              <div key={item.id}>
                <div className="flex gap-4 md:gap-6">
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="relative shrink-0 h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-lg border bg-muted"
                  >
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 768px) 96px, 128px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="hover:underline group"
                    >
                      <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: {formatPrice(productPrice)} each</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-lg md:text-xl font-bold">
                        {formatPrice(itemTotal)}
                      </p>
                    </div>
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
