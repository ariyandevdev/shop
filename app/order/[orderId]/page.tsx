import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { OrderItems } from "./OrderItems";
import { OrderSummary } from "./OrderSummary";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>;
}): Promise<Metadata> {
  const session = await auth();
  const { orderId } = await params;

  if (!session?.user?.id) {
    return {
      title: "Order Details - Shop",
      description: "View your order details",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!order) {
    return {
      title: "Order Not Found - Shop",
      description: "The order you are looking for could not be found.",
    };
  }

  // Check if user owns this order or is an admin
  const isOwner = order.userId === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      title: "Order Not Found - Shop",
      description: "The order you are looking for could not be found.",
    };
  }

  const itemsCount = order.items.length;
  const total = formatPrice(order.total);

  return {
    title: `Order ${orderId.slice(0, 8).toUpperCase()} - Shop`,
    description: `Order details: ${itemsCount} item${itemsCount !== 1 ? "s" : ""}, Total: ${total}, Status: ${order.status}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface OrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth();
  const { orderId } = await params;

  // Check authentication
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/order/${orderId}`);
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
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
    },
  });

  if (!order) {
    notFound();
  }

  // Check if user owns this order or is an admin
  const isOwner = order.userId === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    notFound(); // Return 404 instead of 403 to prevent order ID enumeration
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
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Orders", href: "/orders" },
          { label: `Order ${orderId.slice(0, 8)}`, href: `/order/${orderId}` },
        ]}
      />

      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                  Order Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Order ID: {orderId}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Order Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total Amount</p>
                <p className="font-bold text-lg">{formatPrice(order.total)}</p>
              </div>
              {isAdmin && order.user && (
                <>
                  <div>
                    <p className="text-muted-foreground mb-1">Customer</p>
                    <p className="font-medium">{order.user.name || order.user.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Customer Email</p>
                    <p className="font-medium">{order.user.email}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <OrderItems items={order.items} />

        {/* Order Summary */}
        <OrderSummary items={order.items} total={order.total} />
      </div>
    </main>
  );
}
