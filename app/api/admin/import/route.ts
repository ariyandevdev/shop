import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  importProductsFromCSV,
  importProductsFromExcel,
} from "@/lib/admin-import";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = formData.get("format") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let result;

    if (format === "csv") {
      const csvContent = await file.text();
      result = await importProductsFromCSV(csvContent);
    } else if (format === "excel") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      result = await importProductsFromExcel(buffer);
    } else {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}

