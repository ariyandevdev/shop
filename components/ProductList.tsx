import { ProductCard } from "@/components/ProductCart";
import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";

interface ProductListProps {
  query?: string;
  sort?: string;
  slug?: string;
}

export async function ProductList({ query, sort, slug }: ProductListProps) {
  const searchQuery = query?.trim() || "";

  // Build where clause for search and category
  const where: any = {};

  if (slug) {
    // Filter by category slug
    where.category = { slug };
  } else if (searchQuery) {
    // Filter by search query
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" as const } },
      {
        description: {
          contains: searchQuery,
          mode: "insensitive" as const,
        },
      },
    ];
  }

  // Build orderBy clause for sorting
  let orderBy: { [key: string]: "asc" | "desc" } = { createdAt: "desc" };
  if (sort === "price-asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { price: "desc" };
  } else if (sort === "name-asc") {
    orderBy = { name: "asc" };
  } else if (sort === "name-desc") {
    orderBy = { name: "desc" };
  }

  // Get products
  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: 10,
  });

  if (products.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-muted-foreground py-8">
          No products found
          {searchQuery
            ? ` for "${searchQuery}"`
            : slug
            ? " in this category"
            : ""}
          .
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {searchQuery && (
        <h1 className="text-2xl font-bold mb-4">
          Search results for &quot;{searchQuery}&quot;
        </h1>
      )}
      <p className="mb-6 text-muted-foreground">
        Showing {products.length} product{products.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
