import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  updateOrderStatus,
  updateOrderTracking,
  createOrderNote,
} from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import Link from "next/link";
import { ArrowLeft, Package, MessageSquare, Truck, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { AdminErrorHandler } from "@/components/AdminErrorHandler";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      notes: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          order: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  async function handleStatusUpdate(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    const result = await updateOrderStatus({
      orderId: id,
      status: status as any,
    });

    if (result.success) {
      redirect(`/admin/orders/${id}?success=Order status updated successfully`);
    } else {
      redirect(
        `/admin/orders/${id}?error=${encodeURIComponent(
          result.error || "Failed to update status"
        )}`
      );
    }
  }

  async function handleTrackingUpdate(formData: FormData) {
    "use server";
    const trackingNumber = formData.get("trackingNumber") as string;
    const result = await updateOrderTracking({
      orderId: id,
      trackingNumber: trackingNumber || undefined,
    });

    if (result.success) {
      redirect(
        `/admin/orders/${id}?success=Tracking number updated successfully`
      );
    } else {
      redirect(
        `/admin/orders/${id}?error=${encodeURIComponent(
          result.error || "Failed to update tracking"
        )}`
      );
    }
  }

  async function handleAddNote(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;
    const result = await createOrderNote({
      orderId: id,
      content,
    });

    if (result.success) {
      redirect(`/admin/orders/${id}?success=Note added successfully`);
    } else {
      redirect(
        `/admin/orders/${id}?error=${encodeURIComponent(
          result.error || "Failed to add note"
        )}`
      );
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <AdminErrorHandler />
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">
                Order {id.slice(0, 8)}...
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Created: {formatDate(order.createdAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
            </div>
            {order.user && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium">
                    {order.user.name || order.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Customer Email
                  </p>
                  <p className="font-medium">{order.user.email}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Update Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleStatusUpdate} className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={order.status}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Update Status
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tracking Number */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleTrackingUpdate} className="space-y-4">
              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  name="trackingNumber"
                  defaultValue={order.trackingNumber || ""}
                  placeholder="Enter tracking number"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Update Tracking
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Order Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <div className="w-px h-full bg-border mt-2"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium">Order Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            {order.status !== "pending" && (
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <div className="w-px h-full bg-border mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">Status: {order.status}</p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tracking Number Added</p>
                  <p className="text-sm text-muted-foreground">
                    {order.trackingNumber}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Order Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleAddNote} className="space-y-2">
            <div>
              <Label htmlFor="note">Add Note</Label>
              <Textarea
                id="note"
                name="content"
                placeholder="Add an internal note about this order..."
                rows={3}
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" size="sm">
              Add Note
            </Button>
          </form>

          {order.notes.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              {order.notes.map((note) => (
                <div key={note.id} className="p-3 rounded border bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${Number(item.price).toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 border-t font-bold text-lg">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
