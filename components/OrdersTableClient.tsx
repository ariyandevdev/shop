"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { BulkActionsToolbar } from "@/components/BulkActionsToolbar";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  user: {
    email: string | null;
    name: string | null;
  } | null;
  items: Array<{ id: string }>;
};

type OrdersTableClientProps = {
  orders: Order[];
  onBulkStatusUpdate: (ids: string[], status: string) => Promise<void>;
};

export function OrdersTableClient({
  orders,
  onBulkStatusUpdate,
}: OrdersTableClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(orders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      alert("Please select a status");
      return;
    }
    await onBulkStatusUpdate(selectedIds, bulkStatus);
    setSelectedIds([]);
    setBulkStatus("");
    router.refresh();
  };

  const allSelected = selectedIds.length === orders.length && orders.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < orders.length;

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
          <span className="text-sm font-medium">
            {selectedIds.length} orders selected
          </span>
          <div className="flex gap-2 ml-auto">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-40 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus}
            >
              Update Status
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">
                <Input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Items</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:underline font-mono text-sm"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {order.user?.name || order.user?.email || "Guest"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

