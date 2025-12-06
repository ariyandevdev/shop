"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number | any;
  };
}

export function AddToCartButton() {
  // const [isAdding, setIsAdding] = useState(false);

  // const handleAddToCart = async () => {
  //   setIsAdding(true);
  //   // TODO: Implement add to cart functionality
  //   setTimeout(() => {
  //     setIsAdding(false);
  //   }, 1000);
  // };

  return (
    <Button
      // onClick={handleAddToCart}
      // disabled={isAdding}
      className="w-full"
      size="lg"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {/* {isAdding ? "Adding..." : "Add to Cart"} */}
    </Button>
  );
}
