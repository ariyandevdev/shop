"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function PriceRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  
  const [minPrice, setMinPrice] = useState(minPriceParam || "");
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || "");

  useEffect(() => {
    setMinPrice(minPriceParam || "");
    setMaxPrice(maxPriceParam || "");
  }, [minPriceParam, maxPriceParam]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice && !isNaN(Number(minPrice)) && Number(minPrice) >= 0) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }
    
    if (maxPrice && !isNaN(Number(maxPrice)) && Number(maxPrice) >= 0) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }
    
    params.delete("page"); // Reset to page 1 when filter changes
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters = minPrice || maxPrice;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Price Range</label>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
            Min Price
          </Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApply();
              }
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
            Max Price
          </Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="No limit"
            min="0"
            step="0.01"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApply();
              }
            }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleApply}
          className="w-full"
        >
          Apply
        </Button>
      </div>
      {hasFilters && (
        <p className="text-xs text-muted-foreground">
          {minPrice && maxPrice
            ? `$${minPrice} - $${maxPrice}`
            : minPrice
            ? `From $${minPrice}`
            : `Up to $${maxPrice}`}
        </p>
      )}
    </div>
  );
}

