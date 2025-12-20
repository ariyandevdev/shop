import { getProductbySlug, getCart } from "@/lib/actions";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CommentsSection from "@/components/CommentsSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import("next").Metadata> {
  const { slug } = await params;
  const product = await getProductbySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for could not be found.",
    };
  }

  const title = `${product.name} | Shop`;
  const description =
    product.description || `Buy ${product.name} at great prices.`;
  const price =
    typeof product.price === "object" && product.price !== null
      ? Number(product.price)
      : typeof product.price === "number"
      ? product.price
      : 0;
  const imageUrl = product.image || "";
  const url = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/product/${slug}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category?.name || "",
      "buy",
      "shop",
      "online",
      "ecommerce",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url,
      siteName: "Shop",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    other: {
      "product:price:amount": price.toString(),
      "product:price:currency": "USD",
      "product:availability": "in stock",
      "product:condition": "new",
    },
  };
}

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductbySlug(slug);
  const cart = await getCart();

  if (!product) {
    return notFound();
  }

  // Calculate available inventory (subtract items in cart)
  const cartQuantity =
    cart?.items.find((item) => item.productId === product.id)?.quantity || 0;
  const availableInventory = Math.max(0, product.inventory - cartQuantity);

  return (
    <main className="container mx-auto py-4">
      <Breadcrumb className="mb-6 px-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {product.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/search/${product.category.slug}`}>
                    {product.category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-lg overflow-hidden h-[200px] md:h-[400px]">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-lg">
                {formatPrice(product.price)}
              </span>
              {product.category && (
                <Badge variant="outline">{product.category.name}</Badge>
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h2 className="font-medium">Description</h2>
              <p>{product.description}</p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h2 className="font-medium">Availability</h2>
              <div className="flex items-center gap-2">
                {availableInventory > 0 ? (
                  <>
                    <Badge variant="outline" className="text-green-600">
                      In stock
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {availableInventory} available
                      {cartQuantity > 0 && (
                        <span className="text-xs">
                          {" "}
                          ({cartQuantity} in cart)
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <Badge variant="outline" className="text-red-600">
                    Out of stock
                  </Badge>
                )}
              </div>
            </div>
            <Separator className="my-4" />
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price:
                  typeof product.price === "object" && product.price !== null
                    ? Number(product.price)
                    : typeof product.price === "number"
                    ? product.price
                    : 0,
                inventory: availableInventory,
              }}
            />
          </div>
        </CardContent>
      </Card>
      <CommentsSection productId={product.id} />
    </main>
  );
};

export default ProductPage;
