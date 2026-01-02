import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Package, AlertTriangle } from "lucide-react";
import { FilterSelect } from "@/components/FilterSelect";
import { updateProduct } from "@/lib/admin-actions";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type InventoryPageProps = {
  searchParams: Promise<{
    search?: string;
    filter?: string;
    sort?: string;
    page?: string;
  }>;
};

const ITEMS_PER_PAGE = 20;
const LOW_STOCK_THRESHOLD = 10;

export default async function AdminInventoryPage({
  searchParams,
}: InventoryPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const { search, filter, sort, page } = params;
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

  // Inventory filter
  if (filter === "out-of-stock") {
    andConditions.push({ inventory: 0 });
  } else if (filter === "low-stock") {
    andConditions.push({
      inventory: {
        lte: LOW_STOCK_THRESHOLD,
        gt: 0,
      },
    });
  } else if (filter === "in-stock") {
    andConditions.push({
      inventory: {
        gt: LOW_STOCK_THRESHOLD,
      },
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Build orderBy
  let orderBy: any = { inventory: "asc" };
  if (sort === "name-asc") {
    orderBy = { name: "asc" };
  } else if (sort === "name-desc") {
    orderBy = { name: "desc" };
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

  async function handleInventoryUpdate(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    const inventory = parseInt(formData.get("inventory") as string, 10);

    if (productId && !isNaN(inventory)) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (product) {
        await updateProduct({
          id: productId,
          inventory,
        });
      }
    }
    redirect("/admin/inventory?success=Inventory updated successfully");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage product stock levels
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <form action="/admin/inventory" method="get" className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              name="search"
              placeholder="Search products..."
              defaultValue={search}
              className="pl-10"
            />
            {filter && <input type="hidden" name="filter" value={filter} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </div>
        </form>
        <div className="w-48">
          <FilterSelect
            name="filter"
            defaultValue={filter || ""}
            options={[
              { value: "", label: "All Products" },
              { value: "out-of-stock", label: "Out of Stock" },
              { value: "low-stock", label: "Low Stock (≤10)" },
              { value: "in-stock", label: "In Stock" },
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
        <div className="w-48">
          <FilterSelect
            name="sort"
            defaultValue={sort || ""}
            options={[
              { value: "", label: "Inventory (Low to High)" },
              { value: "inventory-desc", label: "Inventory (High to Low)" },
              { value: "name-asc", label: "Name (A-Z)" },
              { value: "name-desc", label: "Name (Z-A)" },
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Category
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Current Stock
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Update Inventory
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isOutOfStock = product.inventory === 0;
                const isLowStock =
                  product.inventory > 0 && product.inventory <= LOW_STOCK_THRESHOLD;

                return (
                  <tr key={product.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-md">
                          {product.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.category.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-lg font-bold ${
                          isOutOfStock
                            ? "text-destructive"
                            : isLowStock
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.inventory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isOutOfStock ? (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Out of Stock
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="border-orange-600 text-orange-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          In Stock
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <form action={handleInventoryUpdate} className="flex gap-2">
                        <input type="hidden" name="productId" value={product.id} />
                        <Input
                          name="inventory"
                          type="number"
                          min="0"
                          defaultValue={product.inventory}
                          className="w-24 h-9"
                          required
                        />
                        <Button type="submit" size="sm" variant="outline">
                          Update
                        </Button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/products/${product.id}`}>
                          <Package className="w-4 h-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Button asChild variant="outline">
              <Link
                href={`/admin/inventory?${new URLSearchParams({
                  ...(search && { search }),
                  ...(filter && { filter }),
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
                href={`/admin/inventory?${new URLSearchParams({
                  ...(search && { search }),
                  ...(filter && { filter }),
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

