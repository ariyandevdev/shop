import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

export default function Loading() {
  return (
    <main className="container mx-auto p-4">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Products grid skeleton */}
        <ProductGridSkeleton count={6} />
      </div>
    </main>
  );
}
