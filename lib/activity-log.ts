"use server";

import { prisma } from "./prisma";
import { auth } from "./auth";

export type ActivityAction =
  | "create_product"
  | "update_product"
  | "delete_product"
  | "create_category"
  | "update_category"
  | "delete_category"
  | "update_order_status"
  | "update_user_role"
  | "delete_comment"
  | "create_slider"
  | "update_slider"
  | "delete_slider";

export type EntityType = "product" | "order" | "user" | "category" | "comment" | "slider";

export async function logActivity(
  action: ActivityAction,
  entityType: EntityType,
  entityId: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return; // Don't log if no user session
    }

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action,
        entityType,
        entityId,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
      },
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break the app
    console.error("Failed to log activity:", error);
  }
}

export async function getActivityLogs(
  filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }
) {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 50;
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.action) {
    where.action = filters.action;
  }

  if (filters?.entityType) {
    where.entityType = filters.entityType;
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

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

