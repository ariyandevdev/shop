import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search } from "lucide-react";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { FilterSelect } from "@/components/FilterSelect";
import { ExportButton } from "@/components/ExportButton";
import { OrdersTableClient } from "@/components/OrdersTableClient";

type OrdersPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
};

const ITEMS_PER_PAGE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const { search, status, sort, page } = params;
  const currentPage = parseInt(page || "1", 10);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const where: any = {};
  const andConditions: any[] = [];

  // Search filter
  if (search) {
    andConditions.push({
      OR: [
        { id: { contains: search, mode: "insensitive" as const } },
        { user: { email: { contains: search, mode: "insensitive" as const } } },
      ],
    });
  }

  // Status filter
  if (status) {
    andConditions.push({ status });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sort === "date-asc") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "total-asc") {
    orderBy = { total: "asc" };
  } else if (sort === "total-desc") {
    orderBy = { total: "desc" };
  } else if (sort === "status-asc") {
    orderBy = { status: "asc" };
  } else if (sort === "status-desc") {
    orderBy = { status: "desc" };
  }

  // Get total count and orders
  const [totalCount, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  async function handleBulkStatusUpdate(ids: string[], status: string) {
    "use server";
    const { bulkUpdateOrderStatus } = await import("@/lib/admin-actions");
    await bulkUpdateOrderStatus(ids, status);
    redirect("/admin/orders?success=Bulk status update completed");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <ExportButton
            exportType="orders"
            format="csv"
            filters={{ status }}
          />
          <ExportButton
            exportType="orders"
            format="excel"
            filters={{ status }}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <form action="/admin/orders" method="get" className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              name="search"
              placeholder="Search by order ID or email..."
              defaultValue={search}
              className="pl-10"
            />
            {status && <input type="hidden" name="status" value={status} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </div>
        </form>
        <div className="w-48">
          <FilterSelect
            name="status"
            defaultValue={status || ""}
            options={[
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
        <div className="w-48">
          <FilterSelect
            name="sort"
            defaultValue={sort || ""}
            options={[
              { value: "", label: "Date (Newest First)" },
              { value: "date-asc", label: "Date (Oldest First)" },
              { value: "total-asc", label: "Total (Low to High)" },
              { value: "total-desc", label: "Total (High to Low)" },
              { value: "status-asc", label: "Status (A-Z)" },
              { value: "status-desc", label: "Status (Z-A)" },
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTableClient
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          user: o.user,
          items: o.items,
        }))}
        onBulkStatusUpdate={handleBulkStatusUpdate}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Button asChild variant="outline">
              <Link
                href={`/admin/orders?${new URLSearchParams({
                  ...(search && { search }),
                  ...(status && { status }),
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
                href={`/admin/orders?${new URLSearchParams({
                  ...(search && { search }),
                  ...(status && { status }),
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
