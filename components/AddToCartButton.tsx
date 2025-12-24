"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { addToCart } from "@/lib/actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { handleError } from "@/lib/utils";

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
      toast.success(`${product.name} added to cart!`);
      window.dispatchEvent(new Event("cartUpdated"));
      router.refresh();
    } catch (error) {
      const errorMessage = handleError(error, "Failed to add item to cart. Please try again.");
      toast.error(errorMessage);
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
