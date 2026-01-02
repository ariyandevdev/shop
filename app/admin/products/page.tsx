import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, Search, Edit } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { FilterSelect } from "@/components/FilterSelect";
import { deleteProduct } from "@/lib/admin-actions";
import { redirect } from "next/navigation";
import { ExportButton } from "@/components/ExportButton";
import { ProductsTableClient } from "@/components/ProductsTableClient";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

const ITEMS_PER_PAGE = 20;

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const { search, category, sort, page } = params;
  const currentPage = parseInt(page || "1", 10);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const where: any = {};
  const andConditions: any[] = [];

  // Search filter
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    });
  }

  // Category filter
  if (category) {
    andConditions.push({ category: { slug: category } });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sort === "name-asc") {
    orderBy = { name: "asc" };
  } else if (sort === "name-desc") {
    orderBy = { name: "desc" };
  } else if (sort === "price-asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { price: "desc" };
  } else if (sort === "inventory-asc") {
    orderBy = { inventory: "asc" };
  } else if (sort === "inventory-desc") {
    orderBy = { inventory: "desc" };
  }

  // Get total count and products
  const [totalCount, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        category: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  async function handleBulkDelete(ids: string[]) {
    "use server";
    const { bulkDeleteProducts } = await import("@/lib/admin-actions");
    await bulkDeleteProducts(ids);
    redirect("/admin/products?success=Bulk delete completed");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <ExportButton exportType="products" format="csv" />
          <ExportButton exportType="products" format="excel" />
          <Button asChild variant="outline">
            <Link href="/admin/products/import">
              <Plus className="w-4 h-4 mr-2" />
              Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <form action="/admin/products" method="get" className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              name="search"
              placeholder="Search products..."
              defaultValue={search}
              className="pl-10"
            />
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </div>
        </form>
        <div className="w-48">
          <FilterSelect
            name="category"
            defaultValue={category || ""}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((cat) => ({
                value: cat.slug,
                label: cat.name,
              })),
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
        <div className="w-48">
          <FilterSelect
            name="sort"
            defaultValue={sort || ""}
            options={[
              { value: "", label: "Sort by..." },
              { value: "name-asc", label: "Name (A-Z)" },
              { value: "name-desc", label: "Name (Z-A)" },
              { value: "price-asc", label: "Price (Low to High)" },
              { value: "price-desc", label: "Price (High to Low)" },
              { value: "inventory-asc", label: "Inventory (Low to High)" },
              { value: "inventory-desc", label: "Inventory (High to Low)" },
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <ProductsTableClient
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          inventory: p.inventory,
          category: { name: p.category.name },
        }))}
        onBulkDelete={handleBulkDelete}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Button asChild variant="outline">
              <Link
                href={`/admin/products?${new URLSearchParams({
                  ...(search && { search }),
                  ...(category && { category }),
                  ...(sort && { sort }),
                  page: (currentPage - 1).toString(),
                }).toString()}`}
              >
                Previous
              </Link>
            </Button>
          )}
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Button asChild variant="outline">
              <Link
                href={`/admin/products?${new URLSearchParams({
                  ...(search && { search }),
                  ...(category && { category }),
                  ...(sort && { sort }),
                  page: (currentPage + 1).toString(),
                }).toString()}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
