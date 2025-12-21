import Link from "next/link";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductList } from "@/components/ProductList";
import { SortButtons } from "@/components/SortButtons";
import ProductsSkeleton from "../ProductsSkeleton";

type ProductsPageProps = {
  searchParams: Promise<{
    query?: string;
    sort?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const {
    query,
    sort,
    category,
    minPrice,
    maxPrice,
    inStock,
    page,
  } = params;

  return (
    <div className="container mx-auto p-4">
      <Breadcrumb className="mb-6 px-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <ProductFilters />

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          <Suspense
            fallback={
              <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
            }
          >
            <SortButtons />
          </Suspense>

          <Suspense
            key={`${query}-${sort}-${category}-${minPrice}-${maxPrice}-${inStock}-${page}`}
            fallback={<ProductsSkeleton />}
          >
            <ProductList
              query={query}
              sort={sort}
              category={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStock={inStock}
              page={page}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
