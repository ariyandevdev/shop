import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Suspense } from "react";
import ProductsSkeleton from "../ProductsSkeleton";
import { ProductList } from "@/components/ProductList";
import { SortButtons } from "@/components/SortButtons";

type SearchPageProps = {
  searchParams: Promise<{ query?: string; sort?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const sort = params.sort;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    {
      label: query ? `Results for "${query}"` : "Search",
      href: query ? `/search?query=${encodeURIComponent(query)}` : "/search",
    },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="container mx-auto px-4">
        <Suspense
          fallback={
            <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
          }
        >
          <SortButtons />
        </Suspense>
      </div>

      <Suspense key={`${query}-${sort}`} fallback={<ProductsSkeleton />}>
        <ProductList query={query} sort={sort} />
      </Suspense>
    </>
  );
}
