"use server";

import { prisma } from "./prisma";

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper function to get date 90 days ago
function get90DaysAgo(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Helper function to convert Decimal to number
function toNumber(value: any): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  if (value && typeof value.toString === "function") {
    return parseFloat(value.toString()) || 0;
  }
  return 0;
}

export interface SalesRevenueDataPoint {
  date: string;
  revenue: number;
}

export interface OrdersCountDataPoint {
  date: string;
  count: number;
}

export interface TopProductDataPoint {
  name: string;
  revenue: number;
  quantity: number;
}

export interface RevenueByCategoryDataPoint {
  name: string;
  revenue: number;
}

export interface OrderStatusDataPoint {
  name: string;
  value: number;
}

/**
 * Get sales revenue aggregated by day for the last 90 days
 */
export async function getSalesRevenueData(): Promise<SalesRevenueDataPoint[]> {
  try {
    const startDate = get90DaysAgo();
    
    const orders = await prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by date and sum revenue
    const revenueByDate = new Map<string, number>();
    
    orders.forEach((order) => {
      const dateKey = formatDate(order.createdAt);
      const currentRevenue = revenueByDate.get(dateKey) || 0;
      revenueByDate.set(dateKey, currentRevenue + toNumber(order.total));
    });

    // Fill in missing dates with 0 revenue
    const result: SalesRevenueDataPoint[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = formatDate(date);
      result.push({
        date: dateKey,
        revenue: revenueByDate.get(dateKey) || 0,
      });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching sales revenue data:", error);
    return [];
  }
}

/**
 * Get orders count aggregated by day for the last 90 days
 */
export async function getOrdersCountData(): Promise<OrdersCountDataPoint[]> {
  try {
    const startDate = get90DaysAgo();
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date and count orders
    const countByDate = new Map<string, number>();
    
    orders.forEach((order) => {
      const dateKey = formatDate(order.createdAt);
      const currentCount = countByDate.get(dateKey) || 0;
      countByDate.set(dateKey, currentCount + 1);
    });

    // Fill in missing dates with 0 count
    const result: OrdersCountDataPoint[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = formatDate(date);
      result.push({
        date: dateKey,
        count: countByDate.get(dateKey) || 0,
      });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching orders count data:", error);
    return [];
  }
}

/**
 * Get top 10 selling products by revenue for the last 90 days
 */
export async function getTopProductsData(): Promise<TopProductDataPoint[]> {
  try {
    const startDate = get90DaysAgo();
    
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: "cancelled" },
          createdAt: { gte: startDate },
        },
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    // Aggregate by product
    const productMap = new Map<
      string,
      { name: string; revenue: number; quantity: number }
    >();

    orderItems.forEach((item) => {
      const productId = item.productId;
      const existing = productMap.get(productId) || {
        name: item.product.name,
        revenue: 0,
        quantity: 0,
      };

      const itemRevenue = toNumber(item.price) * item.quantity;
      productMap.set(productId, {
        name: item.product.name,
        revenue: existing.revenue + itemRevenue,
        quantity: existing.quantity + item.quantity,
      });
    });

    // Convert to array, sort by revenue, and take top 10
    const result = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((item) => ({
        name: item.name,
        revenue: item.revenue,
        quantity: item.quantity,
      }));

    return result;
  } catch (error) {
    console.error("Error fetching top products data:", error);
    return [];
  }
}

/**
 * Get revenue aggregated by product category for the last 90 days
 */
export async function getRevenueByCategoryData(): Promise<
  RevenueByCategoryDataPoint[]
> {
  try {
    const startDate = get90DaysAgo();
    
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: "cancelled" },
          createdAt: { gte: startDate },
        },
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Aggregate by category
    const categoryMap = new Map<string, number>();

    orderItems.forEach((item) => {
      const categoryName = item.product.category.name;
      const itemRevenue = toNumber(item.price) * item.quantity;
      const currentRevenue = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentRevenue + itemRevenue);
    });

    // Convert to array and sort by revenue
    const result = Array.from(categoryMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    return result;
  } catch (error) {
    console.error("Error fetching revenue by category data:", error);
    return [];
  }
}

/**
 * Get order count grouped by status for the last 90 days
 */
export async function getOrderStatusData(): Promise<OrderStatusDataPoint[]> {
  try {
    const startDate = get90DaysAgo();
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        status: true,
      },
    });

    // Count by status
    const statusMap = new Map<string, number>();

    orders.forEach((order) => {
      const currentCount = statusMap.get(order.status) || 0;
      statusMap.set(order.status, currentCount + 1);
    });

    // Convert to array and format status names
    const statusLabels: Record<string, string> = {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    const result = Array.from(statusMap.entries()).map(([status, value]) => ({
      name: statusLabels[status] || status,
      value,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching order status data:", error);
    return [];
  }
}

