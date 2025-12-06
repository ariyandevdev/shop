import { ProductCard } from "@/components/ProductCart";
import { ProductPagination } from "@/components/ProductPagination";
import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";

interface HomeProps {
  searchParams:
    | Promise<{
        page?: string;
      }>
    | {
        page?: string;
      };
}

const ITEMS_PER_PAGE = 3;

export default async function Home(props: HomeProps) {
  const searchParams = await Promise.resolve(props.searchParams);
  const currentPage = Number(searchParams?.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get total count and paginated products
  const [totalProducts, products] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      skip,
      take: ITEMS_PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      <p className="mb-6">
        Showing {products.length} of {totalProducts} products
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/"
      />
    </main>
  );
}
