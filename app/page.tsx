import { ProductCard } from "@/components/ProductCart";
import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";

export default async function Home() {
  const products = await prisma.product.findMany();
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      <p>Showning {products.length} products</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
