import { ProductCard } from "@/components/ProductCart";
import { ProductPagination } from "@/components/ProductPagination";
import { HeroSlider } from "@/components/HeroSlider";
import { prisma } from "@/lib/prisma";
import { getActiveSliders } from "@/lib/actions";
import { Product } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Shop | Your Online Store",
  description:
    "Browse our amazing collection of products. Find the best deals and quality items for your needs.",
  keywords: ["shop", "online store", "products", "ecommerce", "shopping"],
  openGraph: {
    title: "Shop - Your Online Store",
    description:
      "Browse our amazing collection of products. Find the best deals and quality items for your needs.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop - Your Online Store",
    description:
      "Browse our amazing collection of products. Find the best deals and quality items for your needs.",
  },
};

interface HomeProps {
  searchParams:
    | Promise<{
        page?: string;
      }>
    | {
        page?: string;
      };
}

const ITEMS_PER_PAGE = 3;

export default async function Home(props: HomeProps) {
  const searchParams = await Promise.resolve(props.searchParams);
  const currentPage = Number(searchParams?.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get total count and paginated products
  const [totalProducts, products, sliders] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      skip,
      take: ITEMS_PER_PAGE,
    }),
    getActiveSliders(),
  ]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <main className="container mx-auto p-4">
      {/* Hero Slider */}
      {sliders.length > 0 && <HeroSlider items={sliders} />}

      <h1 className="text-3xl font-bold mb-6">Home</h1>
      <p className="mb-6">
        Showing {products.length} of {totalProducts} products
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/"
      />
    </main>
  );
}
