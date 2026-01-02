import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  exportOrdersToCSV,
  exportOrdersToExcel,
  exportProductsToCSV,
  exportProductsToExcel,
  exportUsersToCSV,
  exportUsersToExcel,
} from "@/lib/admin-export";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { type, format, filters } = body;

    let data: string | Buffer;
    let contentType: string;
    let filename: string;

    if (type === "orders") {
      const parsedFilters = filters
        ? {
            status: filters.status,
            startDate: filters.startDate
              ? new Date(filters.startDate)
              : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
          }
        : undefined;

      if (format === "csv") {
        data = await exportOrdersToCSV(parsedFilters);
        contentType = "text/csv";
        filename = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        data = await exportOrdersToExcel(parsedFilters);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        filename = `orders-${new Date().toISOString().split("T")[0]}.xlsx`;
      }
    } else if (type === "products") {
      if (format === "csv") {
        data = await exportProductsToCSV();
        contentType = "text/csv";
        filename = `products-${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        data = await exportProductsToExcel();
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        filename = `products-${new Date().toISOString().split("T")[0]}.xlsx`;
      }
    } else if (type === "users") {
      if (format === "csv") {
        data = await exportUsersToCSV();
        contentType = "text/csv";
        filename = `users-${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        data = await exportUsersToExcel();
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        filename = `users-${new Date().toISOString().split("T")[0]}.xlsx`;
      }
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

