"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number | any;
    inventory: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  // const [isAdding, setIsAdding] = useState(false);

  // const handleAddToCart = async () => {
  //   setIsAdding(true);
  //   // TODO: Implement add to cart functionality
  //   setTimeout(() => {
  //     setIsAdding(false);
  //   }, 1000);
  // };

  return (
    <div>
      <Button
        // onClick={handleAddToCart}
        // disabled={isAdding}
        disabled={product.inventory === 0}
        className="w-full"
        size="lg"
      >
        <ShoppingCart className="mr-1 w-4 h-4" />
        {product.inventory > 0 ? "Add to cart" : "Out of stock"}
      </Button>
    </div>
  );
}
