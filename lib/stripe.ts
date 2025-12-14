import { Prisma } from "@prisma/client";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});
export type OrdersWithItemsAndProducts = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export async function createCheckoutSession(order: OrdersWithItemsAndProducts) {
  if (!order || order.items.length === 0) {
    throw new Error("Order not found");
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    order.items.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            description: item.product.description ?? "",
            images: [item.product.image ?? ""],
          },
          unit_amount: item.product.price.toNumber() * 100,
        },
        quantity: item.quantity,
      };
    });

  try {
    const session = await stripe.checkout.sessions.create({
      line_items,
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: order.id,
      },
    });
    return session;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
