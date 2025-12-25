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

export async function getActiveSliders() {
  const sliders = await prisma.slider.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: "asc",
    },
  });
  return sliders;
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

// Serialized version for client components (Decimal converted to number, image as string)
export type SerializedShoppingCart = Omit<ShoppingCart, "items"> & {
  items: Array<
    Omit<ShoppingCart["items"][0], "product"> & {
      product: Omit<ShoppingCart["items"][0]["product"], "price" | "image"> & {
        price: number;
        image: string | null;
      };
    }
  >;
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

  return await prisma.cart.findUnique({
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

export async function getCart(): Promise<SerializedShoppingCart | null> {
  const cart = await findCartFromCookie();

  if (!cart) {
    return null;
  }

  // Convert Decimal fields to numbers and ensure all fields are serializable
  const serializedCart: SerializedShoppingCart = {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
        image: item.product.image ? String(item.product.image) : item.product.image,
      },
    })),
    size: cart.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: cart.items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0
    ),
  };

  return serializedCart;
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

export async function getCartSize(): Promise<number> {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) {
    return 0;
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: true,
    },
  });

  if (!cart) {
    return 0;
  }

  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

export async function addToCart(productId: string, quantity: number) {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }
  const cart = await getOrCreateCart();
  const existingitem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId: productId },
  });
  if (existingitem) {
    await prisma.cartItem.update({
      where: { id: existingitem.id },
      data: { quantity: existingitem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: productId, quantity: quantity },
    });
  }
  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
  return { success: true };
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
) {
  if (quantity <= 0) {
    // If quantity is 0 or less, remove the item
    await removeFromCart(cartItemId);
    return { success: true };
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
  return { success: true };
}

export async function incrementCartItem(cartItemId: string) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: cartItem.quantity + 1 },
  });
  return { success: true };
}

export async function decrementCartItem(cartItemId: string) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  if (cartItem.quantity <= 1) {
    // Remove item if quantity would be 0
    await removeFromCart(cartItemId);
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: cartItem.quantity - 1 },
    });
  }
  return { success: true };
}