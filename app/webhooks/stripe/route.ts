import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe-signature header", {
      status: 400,
    });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("No orderId found in session metadata");
        return new NextResponse("Missing orderId", { status: 400 });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      console.log("✅ Order paid:", orderId);
    } else {
      console.log("Unhandled event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook verification failed:", err.message);
    return new NextResponse("Webhook Error", { status: 400 });
  }
}
