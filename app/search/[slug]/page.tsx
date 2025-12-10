import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Suspense } from "react";
import ProductsSkeleton from "../../ProductsSkeleton";
import { ProductList } from "@/components/ProductList";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SortButtons } from "@/components/SortButtons";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

async function productsByCategory(slug: string) {
  const products = await prisma.product.findMany({
    where: { category: { slug } },
  });
  return products;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
    },
  });
  if (!category) {
    return notFound();
  }
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: category.name, href: `/search/${category.slug}` },
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
      <Suspense key={`${slug}-${sort}`} fallback={<ProductsSkeleton />}>
        <ProductList slug={slug} sort={sort} />
      </Suspense>
    </>
  );
}
