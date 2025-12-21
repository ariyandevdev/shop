"use client";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    const params = new URLSearchParams(searchParams.toString());
    
    if (trimmedQuery) {
      params.set("query", trimmedQuery);
    } else {
      params.delete("query");
    }
    params.delete("page"); // Reset to page 1 when search changes
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <form className="w-full relative" onSubmit={handleSearch}>
      <SearchIcon className="absolute w-4 h-4 text-muted-foreground left-2.5 top-1/2 -translate-y-1/2" />
      <Input
        placeholder="Search products..."
        type="search"
        className="pl-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

