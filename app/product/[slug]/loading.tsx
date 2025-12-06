import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProductLoading() {
  return (
    <main className="container mx-auto py-4">
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Skeleton */}
          <div className="relative rounded-lg overflow-hidden h-[200px] md:h-[400px]">
            <Skeleton className="w-full h-full" />
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-9 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Description Section */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            
            <Separator className="my-4" />
            
            {/* Availability Section */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <Separator className="my-4" />
            
            {/* Add to Cart Button */}
            <Skeleton className="h-11 w-full" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

