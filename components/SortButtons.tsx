"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "", label: "Default", icon: ArrowUpDown },
  { value: "price-asc", label: "Price: Low to High", icon: ArrowUp },
  { value: "price-desc", label: "Price: High to Low", icon: ArrowDown },
  { value: "name-asc", label: "Name: A to Z", icon: SortAsc },
  { value: "name-desc", label: "Name: Z to A", icon: SortDesc },
];

export function SortButtons() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "";

  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sortValue) {
      params.set("sort", sortValue);
    } else {
      params.delete("sort");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">
        Sort by:
      </span>
      {sortOptions.map((option) => {
        const Icon = option.icon;
        const isActive = currentSort === option.value;
        return (
          <Button
            key={option.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort(option.value)}
            className={cn(
              "gap-2",
              isActive && "bg-primary text-primary-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
