"use server";

import { cookies } from "next/headers";
import { getCart } from "./actions";
import { prisma } from "./prisma";
import { createCheckoutSession } from "./stripe";

export async function ProcessCheckout() {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart not found");
  }

  let orderId: string | null = null;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const total = cart.subtotal;
      const newOrder = await tx.order.create({
        data: {
          total,
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
        status: "pending",
      },
    });
    (await cookies()).delete("cartId");
    return order;
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
