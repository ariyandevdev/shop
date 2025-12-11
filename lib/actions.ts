"use server";

import { Prisma } from "@prisma/client";
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

export type CartWithProducts = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export type ShoppingCart = CartWithProducts & {
  size: number;
  subtotal: number;
};

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

import { cookies } from "next/headers";

async function findCartFromCookie(): Promise<CartWithProducts | null> {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) {
    return null;
  }

  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function getCart(): Promise<ShoppingCart | null> {
  const cart = await findCartFromCookie();

  if (!cart) {
    return null;
  }

  return {
    ...cart,
    size: cart.items.length,
    subtotal: cart.items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0
    ),
  };
}

async function getOrCreateCart(): Promise<CartWithProducts> {
  let cart = await findCartFromCookie();

  if (cart) {
    return cart;
  }

  cart = await prisma.cart.create({
    data: {},
    include: { items: { include: { product: true } } },
  });

  (await cookies()).set("cartId", cart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return cart;
}
