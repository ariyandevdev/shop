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
