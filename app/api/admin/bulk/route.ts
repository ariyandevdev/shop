import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { bulkDeleteProducts, bulkUpdateOrderStatus } from "@/lib/admin-actions";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { action, ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No items selected" },
        { status: 400 }
      );
    }

    let result;

    if (action === "delete-products") {
      result = await bulkDeleteProducts(ids);
    } else if (action === "update-order-status" && status) {
      result = await bulkUpdateOrderStatus(ids, status);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}

