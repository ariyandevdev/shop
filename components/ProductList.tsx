import { ProductCard } from "@/components/ProductCart";
import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";
import { ProductPagination } from "./ProductPagination";

interface ProductListProps {
  query?: string;
  sort?: string;
  slug?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  page?: string;
  pageSize?: number;
}

export async function ProductList({
  query,
  sort,
  slug,
  category,
  minPrice,
  maxPrice,
  inStock,
  page = "1",
  pageSize = 12,
}: ProductListProps) {
  const searchQuery = query?.trim() || "";
  const currentPage = parseInt(page, 10) || 1;
  const skip = (currentPage - 1) * pageSize;

  // Build where clause combining all filters
  const where: any = {};
  const andConditions: any[] = [];

  // Category filter - support both slug (legacy) and category param (new)
  if (slug) {
    andConditions.push({ category: { slug } });
  } else if (category) {
    const categorySlugs = category.split(",").filter(Boolean);
    if (categorySlugs.length > 0) {
      andConditions.push({ category: { slug: { in: categorySlugs } } });
    }
  }

  // Price range filter
  if (minPrice && !isNaN(Number(minPrice))) {
    andConditions.push({ price: { gte: Number(minPrice) } });
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    andConditions.push({ price: { lte: Number(maxPrice) } });
  }

  // In stock filter
  if (inStock === "true" || inStock === "1") {
    andConditions.push({ inventory: { gt: 0 } });
  }

  // Search query filter
  if (searchQuery) {
    const searchConditions = [
      { name: { contains: searchQuery, mode: "insensitive" as const } },
      {
        description: {
          contains: searchQuery,
          mode: "insensitive" as const,
        },
      },
    ];
    andConditions.push({ OR: searchConditions });
  }

  // Combine all AND conditions
  if (andConditions.length > 0) {
    where.AND = andConditions;
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

  // Get total count for pagination
  const totalCount = await prisma.product.count({ where });

  // Get products with pagination
  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  if (products.length === 0) {
    return (
      <div>
        <p className="text-center text-muted-foreground py-8">
          No products found
          {searchQuery
            ? ` for "${searchQuery}"`
            : slug
            ? " in this category"
            : category
            ? " matching your filters"
            : ""}
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Showing {skip + 1}-{Math.min(skip + pageSize, totalCount)} of{" "}
          {totalCount} product{totalCount !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {totalPages > 1 && (
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/products"
        />
      )}
    </div>
  );
}
