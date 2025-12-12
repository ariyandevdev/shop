"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { addToCart } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number | any;
    inventory: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (product.inventory === 0 || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      window.dispatchEvent(new Event("cartUpdated"));
      router.refresh();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleAddToCart}
        disabled={product.inventory === 0 || isAdding}
        className="w-full"
        size="lg"
      >
        <ShoppingCart className="mr-1 w-4 h-4" />
        {isAdding
          ? "Adding..."
          : product.inventory > 0
          ? "Add to cart"
          : "Out of stock"}
      </Button>
    </div>
  );
}
