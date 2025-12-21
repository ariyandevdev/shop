"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { getCategories } from "@/lib/actions";

interface Category {
  name: string;
  slug: string;
}

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);

  const selectedCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleCategoryToggle = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = selectedCategories;
    
    let updated: string[];
    if (current.includes(slug)) {
      updated = current.filter((c) => c !== slug);
    } else {
      updated = [...current, slug];
    }

    if (updated.length > 0) {
      params.set("category", updated.join(","));
    } else {
      params.delete("category");
    }
    params.delete("page"); // Reset to page 1 when filter changes

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRemoveCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const updated = selectedCategories.filter((c) => c !== slug);

    if (updated.length > 0) {
      params.set("category", updated.join(","));
    } else {
      params.delete("category");
    }
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Category</label>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedCategories.length > 0
              ? `${selectedCategories.length} selected`
              : "Select categories"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.slug}
              checked={selectedCategories.includes(category.slug)}
              onCheckedChange={() => handleCategoryToggle(category.slug)}
            >
              {category.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((slug) => {
            const category = categories.find((c) => c.slug === slug);
            return (
              <Badge
                key={slug}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {category?.name || slug}
                <button
                  onClick={() => handleRemoveCategory(slug)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

