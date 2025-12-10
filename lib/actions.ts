"use server";

import { prisma } from "./prisma";

export async function getProductbySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });
  return product;
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
      slug: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return categories;
}