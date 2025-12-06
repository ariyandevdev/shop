import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const productSlug = product.slug;

  return (
    <Link href={`/product/${productSlug}`}>
      <Card className="pt-0 overflow-hidden min-h-[400px]">
        <div className="relative aspect-video">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <p>{formatPrice(product.price)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
