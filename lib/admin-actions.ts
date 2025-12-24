"use server";

import { requireAdmin } from "./admin";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Product schemas
const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  image: z.string().url("Image must be a valid URL"),
  categoryId: z.string().uuid("Invalid category ID"),
  inventory: z.number().int().min(0, "Inventory must be non-negative"),
  slug: z.string().optional(),
});

const UpdateProductSchema = ProductSchema.partial().extend({
  id: z.string().uuid(),
});

// Category schemas
const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
});

const UpdateCategorySchema = CategorySchema.extend({
  id: z.string().uuid(),
});

// Order status schema
const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

// User role schema
const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Product Actions
export async function createProduct(data: z.infer<typeof ProductSchema>) {
  await requireAdmin();

  const validationResult = ProductSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const validated = validationResult.data;
  const slug = validated.slug || generateSlug(validated.name);

  try {
    const product = await prisma.product.create({
      data: {
        name: validated.name,
        description: validated.description,
        price: validated.price,
        image: validated.image,
        categoryId: validated.categoryId,
        inventory: validated.inventory,
        slug,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, product };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        error: "A product with this slug already exists",
      };
    }
    return {
      success: false,
      error: "Failed to create product",
    };
  }
}

export async function updateProduct(data: z.infer<typeof UpdateProductSchema>) {
  await requireAdmin();

  const validationResult = UpdateProductSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const { id, ...updateData } = validationResult.data;

  // Generate slug if name is being updated
  if (updateData.name && !updateData.slug) {
    updateData.slug = generateSlug(updateData.name);
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, product };
  } catch (error: any) {
    if (error.code === "P2025") {
      return {
        success: false,
        error: "Product not found",
      };
    }
    if (error.code === "P2002") {
      return {
        success: false,
        error: "A product with this slug already exists",
      };
    }
    return {
      success: false,
      error: "Failed to update product",
    };
  }
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") {
      return {
        success: false,
        error: "Product not found",
      };
    }
    return {
      success: false,
      error: "Failed to delete product",
    };
  }
}

// Category Actions
export async function createCategory(data: z.infer<typeof CategorySchema>) {
  await requireAdmin();

  const validationResult = CategorySchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const validated = validationResult.data;
  const slug = validated.slug || generateSlug(validated.name);

  try {
    const category = await prisma.category.create({
      data: {
        name: validated.name,
        slug,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true, category };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        error: "A category with this slug already exists",
      };
    }
    return {
      success: false,
      error: "Failed to create category",
    };
  }
}

export async function updateCategory(
  data: z.infer<typeof UpdateCategorySchema>
) {
  await requireAdmin();

  const validationResult = UpdateCategorySchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const { id, ...updateData } = validationResult.data;

  // Generate slug if name is being updated
  if (updateData.name && !updateData.slug) {
    updateData.slug = generateSlug(updateData.name);
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true, category };
  } catch (error: any) {
    if (error.code === "P2025") {
      return {
        success: false,
        error: "Category not found",
      };
    }
    if (error.code === "P2002") {
      return {
        success: false,
        error: "A category with this slug already exists",
      };
    }
    return {
      success: false,
      error: "Failed to update category",
    };
  }
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();

  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${productCount} product(s). Please remove or reassign products first.`,
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") {
      return {
        success: false,
        error: "Category not found",
      };
    }
    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}

// Order Actions
export async function updateOrderStatus(
  data: z.infer<typeof UpdateOrderStatusSchema>
) {
  await requireAdmin();

  const validationResult = UpdateOrderStatusSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const { orderId, status } = validationResult.data;

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/orders");

    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") {
      return {
        success: false,
        error: "Order not found",
      };
    }
    return {
      success: false,
      error: "Failed to update order status",
    };
  }
}

// User Actions
export async function updateUserRole(
  data: z.infer<typeof UpdateUserRoleSchema>
) {
  await requireAdmin();

  const validationResult = UpdateUserRoleSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const { userId, role } = validationResult.data;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");

    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") {
      return {
        success: false,
        error: "User not found",
      };
    }
    return {
      success: false,
      error: "Failed to update user role",
    };
  }
}

// Comment Actions
export async function deleteComment(commentId: string) {
  await requireAdmin();

  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath("/admin/comments");

    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") {
      return {
        success: false,
        error: "Comment not found",
      };
    }
    return {
      success: false,
      error: "Failed to delete comment",
    };
  }
}
