"use client";

import { useEffect, useState } from "react";
import { getCartSize } from "@/lib/actions";

export function CartCount() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    async function fetchCartSize() {
      const size = await getCartSize();
      setCount(size);
    }
    fetchCartSize();
  }, []);

  // Listen for cart updates via custom event
  useEffect(() => {
    const handleCartUpdate = () => {
      getCartSize().then((size) => {
        setCount(size);
      });
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {count}
    </span>
  );
}
