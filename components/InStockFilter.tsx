"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function InStockFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const inStock = searchParams.get("inStock") === "true" || searchParams.get("inStock") === "1";

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (inStock) {
      params.delete("inStock");
    } else {
      params.set("inStock", "true");
    }
    params.delete("page"); // Reset to page 1 when filter changes
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Availability</label>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start",
          inStock && "bg-accent"
        )}
        onClick={handleToggle}
      >
        <div
          className={cn(
            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
            inStock
              ? "bg-primary text-primary-foreground"
              : "bg-background"
          )}
        >
          {inStock && <CheckIcon className="h-3 w-3" />}
        </div>
        In Stock Only
      </Button>
    </div>
  );
}

