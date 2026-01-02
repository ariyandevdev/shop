"use server";

import { prisma } from "./prisma";

// Helper to convert Decimal to number
function toNumber(value: any): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  if (value && typeof value.toString === "function") {
    return parseFloat(value.toString()) || 0;
  }
  return 0;
}

export interface TimePeriodComparison {
  current: {
    revenue: number;
    orders: number;
    customers: number;
    averageOrderValue: number;
  };
  previous: {
    revenue: number;
    orders: number;
    customers: number;
    averageOrderValue: number;
  };
  change: {
    revenue: number;
    orders: number;
    customers: number;
    averageOrderValue: number;
  };
}

export async function getTimePeriodComparison(
  period: "month" | "year"
): Promise<TimePeriodComparison> {
  const now = new Date();
  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;

  if (period === "month") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else {
    currentStart = new Date(now.getFullYear(), 0, 1);
    currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    previousStart = new Date(now.getFullYear() - 1, 0, 1);
    previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
  }

  const [currentData, previousData] = await Promise.all([
    Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: {
          status: { not: "cancelled" },
          createdAt: { gte: currentStart, lte: currentEnd },
        },
      }),
      prisma.order.groupBy({
        by: ["userId"],
        where: {
          status: { not: "cancelled" },
          createdAt: { gte: currentStart, lte: currentEnd },
        },
      }),
    ]),
    Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: {
          status: { not: "cancelled" },
          createdAt: { gte: previousStart, lte: previousEnd },
        },
      }),
      prisma.order.groupBy({
        by: ["userId"],
        where: {
          status: { not: "cancelled" },
          createdAt: { gte: previousStart, lte: previousEnd },
        },
      }),
    ]),
  ]);

  const currentRevenue = toNumber(currentData[0]._sum.total);
  const currentOrders = currentData[0]._count;
  const currentCustomers = new Set(
    currentData[1].map((g) => g.userId).filter(Boolean)
  ).size;
  const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;

  const previousRevenue = toNumber(previousData[0]._sum.total);
  const previousOrders = previousData[0]._count;
  const previousCustomers = new Set(
    previousData[1].map((g) => g.userId).filter(Boolean)
  ).size;
  const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current: {
      revenue: currentRevenue,
      orders: currentOrders,
      customers: currentCustomers,
      averageOrderValue: currentAOV,
    },
    previous: {
      revenue: previousRevenue,
      orders: previousOrders,
      customers: previousCustomers,
      averageOrderValue: previousAOV,
    },
    change: {
      revenue: calculateChange(currentRevenue, previousRevenue),
      orders: calculateChange(currentOrders, previousOrders),
      customers: calculateChange(currentCustomers, previousCustomers),
      averageOrderValue: calculateChange(currentAOV, previousAOV),
    },
  };
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  repeatCustomerRate: number;
}

export async function getCustomerAnalytics(): Promise<CustomerAnalytics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [allUsers, newUsers, orders, orderItems] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
      },
      include: {
        user: true,
      },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: "cancelled" },
        },
      },
      include: {
        order: true,
      },
    }),
  ]);

  const customersWithOrders = new Set(
    orders.filter((o) => o.userId).map((o) => o.userId!)
  );
  const returningCustomers = Array.from(customersWithOrders).filter(
    (userId) => {
      const userOrders = orders.filter((o) => o.userId === userId);
      return userOrders.length > 1;
    }
  ).length;

  const totalRevenue = orders.reduce(
    (sum, order) => sum + toNumber(order.total),
    0
  );
  const averageOrderValue =
    orders.length > 0 ? totalRevenue / orders.length : 0;

  // Simple CLV calculation: average order value * average orders per customer
  const ordersPerCustomer =
    customersWithOrders.size > 0
      ? orders.length / customersWithOrders.size
      : 0;
  const customerLifetimeValue = averageOrderValue * ordersPerCustomer;

  const repeatCustomerRate =
    customersWithOrders.size > 0
      ? (returningCustomers / customersWithOrders.size) * 100
      : 0;

  return {
    totalCustomers: allUsers,
    newCustomers: newUsers,
    returningCustomers,
    averageOrderValue,
    customerLifetimeValue,
    repeatCustomerRate,
  };
}

export interface ProductPerformance {
  bestSelling: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
    orders: number;
  }>;
  worstSelling: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
    orders: number;
  }>;
  noSales: Array<{
    id: string;
    name: string;
    inventory: number;
  }>;
}

export async function getProductPerformance(): Promise<ProductPerformance> {
  const [orderItems, allProducts] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: "cancelled" },
        },
      },
      include: {
        product: true,
        order: true,
      },
    }),
    prisma.product.findMany({
      include: {
        orderItems: {
          where: {
            order: {
              status: { not: "cancelled" },
            },
          },
        },
      },
    }),
  ]);

  // Aggregate product sales
  const productMap = new Map<
    string,
    { name: string; revenue: number; quantity: number; orders: Set<string> }
  >();

  orderItems.forEach((item) => {
    const productId = item.productId;
    const existing = productMap.get(productId) || {
      name: item.product.name,
      revenue: 0,
      quantity: 0,
      orders: new Set<string>(),
    };

    const itemRevenue = toNumber(item.price) * item.quantity;
    productMap.set(productId, {
      name: item.product.name,
      revenue: existing.revenue + itemRevenue,
      quantity: existing.quantity + item.quantity,
      orders: existing.orders.add(item.orderId),
    });
  });

  const productsWithSales = Array.from(productMap.entries()).map(
    ([id, data]) => ({
      id,
      name: data.name,
      revenue: data.revenue,
      quantity: data.quantity,
      orders: data.orders.size,
    })
  );

  const bestSelling = productsWithSales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const worstSelling = productsWithSales
    .sort((a, b) => a.revenue - b.revenue)
    .slice(0, 10);

  const productsWithNoSales = allProducts
    .filter((p) => p.orderItems.length === 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      inventory: p.inventory,
    }));

  return {
    bestSelling,
    worstSelling,
    noSales: productsWithNoSales,
  };
}

