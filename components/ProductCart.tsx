import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Product } from "@prisma/client";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border border-green-200 rounded-lg p-4">
      <div className="relative w-full h-48 mb-4">
        <Image
          src={product.image}
          alt={product.name}
          className="object-cover rounded"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-lg font-bold mb-2">{product.name}</h3>
      <p className="text-lg font-bold">{formatPrice(Number(product.price))}</p>
      <p className="text-sm text-gray-500 mb-4">{product.description}</p>
    </div>
  );
}
