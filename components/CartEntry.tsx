"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  incrementCartItem,
  decrementCartItem,
  removeFromCart,
  type SerializedShoppingCart,
} from "@/lib/actions";
import { Plus, Minus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { handleError } from "@/lib/utils";

interface CartEntryProps {
  item: SerializedShoppingCart["items"][0];
}

export function CartEntry({ item }: CartEntryProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const itemPrice = Number(item.product.price);
  const itemTotal = itemPrice * item.quantity;

  const handleIncrement = async () => {
    setIsUpdating(true);
    try {
      await incrementCartItem(item.id);
      window.dispatchEvent(new Event("cartUpdated"));
      router.refresh();
    } catch (error) {
      const errorMessage = handleError(error, "Failed to update quantity. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    setIsUpdating(true);
    try {
      await decrementCartItem(item.id);
      window.dispatchEvent(new Event("cartUpdated"));
      router.refresh();
    } catch (error) {
      const errorMessage = handleError(error, "Failed to update quantity. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeFromCart(item.id);
      toast.success(`${item.product.name} removed from cart`);
      window.dispatchEvent(new Event("cartUpdated"));
      router.refresh();
    } catch (error) {
      const errorMessage = handleError(error, "Failed to remove item. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 md:p-6">
        <div className="flex gap-4 md:gap-6">
          {/* Product Image */}
          <Link
            href={`/product/${item.product.slug}`}
            className="relative shrink-0 h-28 w-28 md:h-32 md:w-32 overflow-hidden rounded-lg border bg-muted block"
          >
            {item.product.image && !imageError ? (
              <img
                src={String(item.product.image)}
                alt={item.product.name}
                className="object-cover w-full h-full"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs">
                No Image
              </div>
            )}
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <Link
                href={`/product/${item.product.slug}`}
                className="hover:underline group"
              >
                <h2 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {item.product.name}
                </h2>
              </Link>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                {formatPrice(itemPrice)} each
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 mt-4">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDecrement}
                  disabled={isUpdating}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm md:text-base font-medium min-w-8 text-center">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleIncrement}
                  disabled={isUpdating}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Price and Delete */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl md:text-2xl font-bold">
                    {formatPrice(itemTotal)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleRemove}
                  disabled={isUpdating}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
