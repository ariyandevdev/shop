"use server";

import { requireAdmin } from "./admin";
import { prisma } from "./prisma";
import { createProduct, updateProduct } from "./admin-actions";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type ProductImportRow = {
  name: string;
  description: string;
  price: string | number;
  category: string;
  inventory: string | number;
  image: string;
  slug?: string;
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePrice(price: string | number): number {
  if (typeof price === "number") return price;
  const cleaned = String(price).replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function parseInventory(inventory: string | number): number {
  if (typeof inventory === "number") return Math.max(0, Math.floor(inventory));
  const parsed = parseInt(String(inventory), 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

export async function importProductsFromCSV(
  csvContent: string
): Promise<{
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
}> {
  await requireAdmin();

  const errors: string[] = [];
  let imported = 0;
  let updated = 0;

  try {
    const result = Papa.parse<ProductImportRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        return header.trim().toLowerCase().replace(/\s+/g, "");
      },
    });

    if (result.errors.length > 0) {
      errors.push(
        ...result.errors.map((e) => `Row ${e.row}: ${e.message}`)
      );
    }

    // Get all categories
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(
      categories.map((cat) => [cat.name.toLowerCase(), cat.id])
    );

    for (let i = 0; i < result.data.length; i++) {
      const row = result.data[i];
      const rowNum = i + 2; // +2 because header is row 1, and arrays are 0-indexed

      try {
        // Validate required fields
        if (!row.name || !row.description || !row.price || !row.category) {
          errors.push(
            `Row ${rowNum}: Missing required fields (name, description, price, or category)`
          );
          continue;
        }

        // Find or create category
        const categoryName = String(row.category).trim();
        const categoryId =
          categoryMap.get(categoryName.toLowerCase()) ||
          (await (async () => {
            const newCategory = await prisma.category.create({
              data: {
                name: categoryName,
                slug: generateSlug(categoryName),
              },
            });
            categoryMap.set(categoryName.toLowerCase(), newCategory.id);
            return newCategory.id;
          })());

        const price = parsePrice(row.price);
        const inventory = parseInventory(row.inventory || 0);
        const slug = row.slug || generateSlug(row.name);
        const image = row.image || "";

        if (price <= 0) {
          errors.push(`Row ${rowNum}: Invalid price (must be > 0)`);
          continue;
        }

        // Check if product exists by slug
        const existingProduct = await prisma.product.findUnique({
          where: { slug },
        });

        if (existingProduct) {
          // Update existing product
          const updateResult = await updateProduct({
            id: existingProduct.id,
            name: row.name,
            description: row.description,
            price,
            inventory,
            categoryId,
            image,
            slug,
          });

          if (updateResult.success) {
            updated++;
          } else {
            errors.push(`Row ${rowNum}: ${updateResult.error}`);
          }
        } else {
          // Create new product
          const createResult = await createProduct({
            name: row.name,
            description: row.description,
            price,
            inventory,
            categoryId,
            image,
            slug,
          });

          if (createResult.success) {
            imported++;
          } else {
            errors.push(`Row ${rowNum}: ${createResult.error}`);
          }
        }
      } catch (error: any) {
        errors.push(`Row ${rowNum}: ${error.message || "Unknown error"}`);
      }
    }

    return {
      success: errors.length === 0,
      imported,
      updated,
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      imported: 0,
      updated: 0,
      errors: [error.message || "Failed to parse CSV file"],
    };
  }
}

export async function importProductsFromExcel(
  excelBuffer: Buffer
): Promise<{
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
}> {
  await requireAdmin();

  const errors: string[] = [];
  let imported = 0;
  let updated = 0;

  try {
    const workbook = XLSX.read(excelBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<ProductImportRow>(worksheet);

    // Get all categories
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(
      categories.map((cat) => [cat.name.toLowerCase(), cat.id])
    );

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 because header is row 1, and arrays are 0-indexed

      try {
        // Normalize field names (Excel might have different casing/spacing)
        const normalizedRow: ProductImportRow = {
          name: String(row.name || "").trim(),
          description: String(row.description || "").trim(),
          price: row.price || row.Price || 0,
          category: String(row.category || row.Category || "").trim(),
          inventory: row.inventory || row.Inventory || 0,
          image: String(row.image || row.Image || "").trim(),
          slug: row.slug || row.Slug,
        };

        // Validate required fields
        if (
          !normalizedRow.name ||
          !normalizedRow.description ||
          !normalizedRow.price ||
          !normalizedRow.category
        ) {
          errors.push(
            `Row ${rowNum}: Missing required fields (name, description, price, or category)`
          );
          continue;
        }

        // Find or create category
        const categoryName = normalizedRow.category;
        const categoryId =
          categoryMap.get(categoryName.toLowerCase()) ||
          (await (async () => {
            const newCategory = await prisma.category.create({
              data: {
                name: categoryName,
                slug: generateSlug(categoryName),
              },
            });
            categoryMap.set(categoryName.toLowerCase(), newCategory.id);
            return newCategory.id;
          })());

        const price = parsePrice(normalizedRow.price);
        const inventory = parseInventory(normalizedRow.inventory || 0);
        const slug = normalizedRow.slug || generateSlug(normalizedRow.name);
        const image = normalizedRow.image || "";

        if (price <= 0) {
          errors.push(`Row ${rowNum}: Invalid price (must be > 0)`);
          continue;
        }

        // Check if product exists by slug
        const existingProduct = await prisma.product.findUnique({
          where: { slug },
        });

        if (existingProduct) {
          // Update existing product
          const updateResult = await updateProduct({
            id: existingProduct.id,
            name: normalizedRow.name,
            description: normalizedRow.description,
            price,
            inventory,
            categoryId,
            image,
            slug,
          });

          if (updateResult.success) {
            updated++;
          } else {
            errors.push(`Row ${rowNum}: ${updateResult.error}`);
          }
        } else {
          // Create new product
          const createResult = await createProduct({
            name: normalizedRow.name,
            description: normalizedRow.description,
            price,
            inventory,
            categoryId,
            image,
            slug,
          });

          if (createResult.success) {
            imported++;
          } else {
            errors.push(`Row ${rowNum}: ${createResult.error}`);
          }
        }
      } catch (error: any) {
        errors.push(`Row ${rowNum}: ${error.message || "Unknown error"}`);
      }
    }

    return {
      success: errors.length === 0,
      imported,
      updated,
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      imported: 0,
      updated: 0,
      errors: [error.message || "Failed to parse Excel file"],
    };
  }
}

