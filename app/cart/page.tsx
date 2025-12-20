import { getCart } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { CartEntry } from "@/components/CartEntry";
import CartSummary from "@/components/CartSummary";
import { Button } from "@/components/ui/button";
import { ProcessCheckout } from "@/lib/orders";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

async function handleCheckout() {
  "use server";
  try {
    const result = await ProcessCheckout();
    if (result) {
      redirect(result.sessionUrl);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Authentication required")
    ) {
      redirect("/auth/signin?callbackUrl=/cart");
    }
    throw error;
  }
}

const CartPage = async () => {
  const cart = await getCart();
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
          Shopping Cart
        </h1>
        <Card>
          <CardContent className="py-16 md:py-20 text-center">
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              Your cart is empty
            </p>
            <Link
              href="/products"
              className="inline-block text-primary hover:underline font-medium text-base md:text-lg transition-colors"
            >
              Continue Shopping →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
        Shopping Cart
      </h1>
      <div className="space-y-4 md:space-y-6">
        {cart.items.map((item) => (
          <CartEntry key={item.id} item={item} />
        ))}
      </div>
      <CartSummary />
      {isAuthenticated ? (
        <form action={handleCheckout}>
          <Button className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </form>
      ) : (
        <Card className="mt-6">
          <CardContent className="py-6 text-center">
            <p className="text-lg font-medium mb-4">
              Please sign in to complete your purchase
            </p>
            <Link href="/auth/signin?callbackUrl=/cart">
              <Button className="w-full" size="lg">
                Sign In to Checkout
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CartPage;
