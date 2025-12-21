"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CategoryFilter } from "./CategoryFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { InStockFilter } from "./InStockFilter";
import { Separator } from "@/components/ui/separator";
import { X, Filter } from "lucide-react";
import ProductSearchInput from "./ProductSearchInput";

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile panel when filters change (URL changes)
  useEffect(() => {
    setMobileOpen(false);
  }, [searchParams]);

  const hasAnyFilter =
    searchParams.get("category") ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice") ||
    searchParams.get("inStock") ||
    searchParams.get("query");

  const handleClearAll = () => {
    const params = new URLSearchParams();
    // Preserve sort if needed, but clear all filters
    const sort = searchParams.get("sort");
    if (sort) {
      params.set("sort", sort);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 px-2 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <ProductSearchInput />
        </div>

        <Separator />

        <CategoryFilter />

        <Separator />

        <PriceRangeFilter />

        <Separator />

        <InStockFilter />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasAnyFilter && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Active
            </span>
          )}
        </Button>
      </div>

      {/* Mobile filter panel */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {filterContent}
        </div>
      )}

      {/* Desktop filter sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4 space-y-4">{filterContent}</div>
      </aside>
    </>
  );
}

