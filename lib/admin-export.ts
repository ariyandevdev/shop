"use server";

import { requireAdmin } from "./admin";
import { prisma } from "./prisma";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// Helper to convert Decimal to number
function toNumber(value: any): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  if (value && typeof value.toString === "function") {
    return parseFloat(value.toString()) || 0;
  }
  return 0;
}

export async function exportOrdersToCSV(
  filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<string> {
  await requireAdmin();

  const where: any = {};
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const csvData = orders.map((order) => ({
    "Order ID": order.id,
    "Date": order.createdAt.toISOString(),
    "Customer Email": order.user?.email || "Guest",
    "Customer Name": order.user?.name || "",
    "Status": order.status,
    "Total": toNumber(order.total),
    "Items": order.items
      .map((item) => `${item.product.name} (x${item.quantity})`)
      .join("; "),
    "Item Count": order.items.length,
  }));

  return Papa.unparse(csvData);
}

export async function exportOrdersToExcel(
  filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Buffer> {
  await requireAdmin();

  const where: any = {};
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const excelData = orders.map((order) => ({
    "Order ID": order.id,
    "Date": order.createdAt.toISOString(),
    "Customer Email": order.user?.email || "Guest",
    "Customer Name": order.user?.name || "",
    "Status": order.status,
    "Total": toNumber(order.total),
    "Items": order.items
      .map((item) => `${item.product.name} (x${item.quantity})`)
      .join("; "),
    "Item Count": order.items.length,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return Buffer.from(excelBuffer);
}

export async function exportProductsToCSV(): Promise<string> {
  await requireAdmin();

  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const csvData = products.map((product) => ({
    "Product ID": product.id,
    "Name": product.name,
    "Description": product.description,
    "Price": toNumber(product.price),
    "Category": product.category.name,
    "Inventory": product.inventory,
    "Slug": product.slug,
    "Image URL": product.image,
    "Created At": product.createdAt.toISOString(),
    "Updated At": product.updatedAt.toISOString(),
  }));

  return Papa.unparse(csvData);
}

export async function exportProductsToExcel(): Promise<Buffer> {
  await requireAdmin();

  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const excelData = products.map((product) => ({
    "Product ID": product.id,
    "Name": product.name,
    "Description": product.description,
    "Price": toNumber(product.price),
    "Category": product.category.name,
    "Inventory": product.inventory,
    "Slug": product.slug,
    "Image URL": product.image,
    "Created At": product.createdAt.toISOString(),
    "Updated At": product.updatedAt.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return Buffer.from(excelBuffer);
}

export async function exportUsersToCSV(): Promise<string> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const csvData = users.map((user) => ({
    "User ID": user.id,
    "Email": user.email,
    "Name": user.name || "",
    "Role": user.role,
    "Total Orders": user._count.orders,
    "Created At": user.createdAt.toISOString(),
  }));

  return Papa.unparse(csvData);
}

export async function exportUsersToExcel(): Promise<Buffer> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const excelData = users.map((user) => ({
    "User ID": user.id,
    "Email": user.email,
    "Name": user.name || "",
    "Role": user.role,
    "Total Orders": user._count.orders,
    "Created At": user.createdAt.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return Buffer.from(excelBuffer);
}

