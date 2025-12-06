import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageX, Home, ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <main className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <Card className="border-2 border-dashed">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <PackageX className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-4xl font-bold">Product Not Found</CardTitle>
            <CardDescription className="text-lg">
              Sorry, we couldn't find the product you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              The product may have been removed, or the link you followed may be incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" size="lg">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

