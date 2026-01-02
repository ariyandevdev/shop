import { requireAdmin } from "@/lib/admin";
import { getActivityLogs } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/FilterSelect";
import { Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type ActivityPageProps = {
  searchParams: Promise<{
    user?: string;
    action?: string;
    entityType?: string;
    page?: string;
  }>;
};

const ITEMS_PER_PAGE = 50;

const actionLabels: Record<string, string> = {
  create_product: "Created Product",
  update_product: "Updated Product",
  delete_product: "Deleted Product",
  create_category: "Created Category",
  update_category: "Updated Category",
  delete_category: "Deleted Category",
  update_order_status: "Updated Order Status",
  update_user_role: "Updated User Role",
  delete_comment: "Deleted Comment",
  create_slider: "Created Slider",
  update_slider: "Updated Slider",
  delete_slider: "Deleted Slider",
};

export default async function AdminActivityPage({
  searchParams,
}: ActivityPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const { user, action, entityType, page } = params;
  const currentPage = parseInt(page || "1", 10);

  const result = await getActivityLogs({
    userId: user,
    action,
    entityType,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  const uniqueActions = Array.from(
    new Set(
      Object.keys(actionLabels).map((a) => ({
        value: a,
        label: actionLabels[a],
      }))
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track all admin actions and changes
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <form action="/admin/activity" method="get" className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              name="user"
              placeholder="Search by user email..."
              defaultValue={user}
              className="pl-10"
            />
            {action && <input type="hidden" name="action" value={action} />}
            {entityType && (
              <input type="hidden" name="entityType" value={entityType} />
            )}
          </div>
        </form>
        <div className="w-48">
          <FilterSelect
            name="action"
            defaultValue={action || ""}
            options={[
              { value: "", label: "All Actions" },
              ...uniqueActions,
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
        <div className="w-48">
          <FilterSelect
            name="entityType"
            defaultValue={entityType || ""}
            options={[
              { value: "", label: "All Types" },
              { value: "product", label: "Product" },
              { value: "order", label: "Order" },
              { value: "user", label: "User" },
              { value: "category", label: "Category" },
              { value: "comment", label: "Comment" },
              { value: "slider", label: "Slider" },
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Entity</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {result.logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No activity logs found
                </td>
              </tr>
            ) : (
              result.logs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {log.user.name || log.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{log.entityType}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.entityId.slice(0, 8)}...
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {log.details ? (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-md">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Button asChild variant="outline">
              <Link
                href={`/admin/activity?${new URLSearchParams({
                  ...(user && { user }),
                  ...(action && { action }),
                  ...(entityType && { entityType }),
                  page: (currentPage - 1).toString(),
                }).toString()}`}
              >
                Previous
              </Link>
            </Button>
          )}
          <span className="flex items-center px-4">
            Page {currentPage} of {result.totalPages}
          </span>
          {currentPage < result.totalPages && (
            <Button asChild variant="outline">
              <Link
                href={`/admin/activity?${new URLSearchParams({
                  ...(user && { user }),
                  ...(action && { action }),
                  ...(entityType && { entityType }),
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

