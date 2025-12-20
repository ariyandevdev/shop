"use server";

import { cookies } from "next/headers";
import { getCart } from "./actions";
import { prisma } from "./prisma";
import { OrdersWithItemsAndProducts, createCheckoutSession } from "./stripe";
import { auth } from "./auth";

export type ProcessCheckoutResult = {
  sessionUrl: string;
  order: OrdersWithItemsAndProducts;
};

export async function ProcessCheckout(): Promise<ProcessCheckoutResult | null> {
  const cart = await getCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart not found");
  }

  if (!session || !userId) {
    throw new Error(
      "Authentication required. Please sign in to complete your purchase."
    );
  }

  let orderId: string | null = null;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const total = cart.subtotal;
      const newOrder = await tx.order.create({
        data: {
          total,
          userId: userId,
        },
      });
      const orderItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        orderId: newOrder.id,
        price: item.product.price,
      }));
      await tx.orderItem.createMany({
        data: orderItems,
      });
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
      await tx.cart.delete({
        where: {
          id: cart.id,
        },
      });

      return newOrder;
    });

    orderId = order.id;
    const fullOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
      include: {
        items: { include: { product: true } },
      },
    });
    if (!fullOrder) {
      throw new Error("Order not found");
    }
    const session = await createCheckoutSession(fullOrder);
    if (!session || !session.id || !session.url) {
      throw new Error("Failed to create checkout session");
    }
    const sessionId = session.id;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: sessionId,
        status: "pending_payment",
      },
    });
    (await cookies()).delete("cartId");
    return {
      sessionUrl: session.url,
      order: fullOrder,
    };
  } catch (error) {
    if (
      orderId &&
      error instanceof Error &&
      error.message.includes("Failed to create checkout session")
    ) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "failed" },
      });
    }
    throw error;
  }
}

export type UserOrder = {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  itemsCount: number;
};

export type GetUserOrdersResult = {
  orders: UserOrder[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export async function getUserOrders(
  page: number = 1,
  pageSize: number = 10
): Promise<GetUserOrdersResult | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const skip = (page - 1) * pageSize;

    // Get total count
    const totalCount = await prisma.order.count({
      where: {
        user: {
          id: session.user.id,
        },
      },
    });

    // Get orders with item count
    const orders = await prisma.order.findMany({
      where: {
        user: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    const formattedOrders: UserOrder[] = orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      itemsCount: order._count.items,
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      orders: formattedOrders,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return null;
  }
}
