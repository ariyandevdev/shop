import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Search } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { redirect } from "next/navigation";
import { AdminErrorHandler } from "@/components/AdminErrorHandler";

type CategoriesPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function AdminCategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const { search } = params;

  // Build where clause
  const where: any = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" as const };
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createCategory({
      name: formData.get("name") as string,
    });

    if (result.success) {
      redirect("/admin/categories?success=Category created successfully");
    } else {
      redirect(
        `/admin/categories?error=${encodeURIComponent(
          result.error || "Failed to create category"
        )}`
      );
    }
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    const result = await updateCategory({
      id: formData.get("id") as string,
      name: formData.get("name") as string,
    });

    if (result.success) {
      redirect("/admin/categories?success=Category updated successfully");
    } else {
      redirect(
        `/admin/categories?error=${encodeURIComponent(
          result.error || "Failed to update category"
        )}`
      );
    }
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const categoryId = formData.get("categoryId") as string;
    if (categoryId) {
      await deleteCategory(categoryId);
      redirect("/admin/categories?success=Category deleted successfully");
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-6">
      <AdminErrorHandler />
      <h1 className="text-2xl sm:text-3xl font-bold">Categories</h1>

      {/* Create Category Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="name" className="sr-only">
                Category Name
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter category name"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search */}
      <form action="/admin/categories" method="get" className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          name="search"
          placeholder="Search categories..."
          defaultValue={search}
          className="pl-10"
        />
      </form>

      {/* Categories List */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Products
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-t hover:bg-muted/50">
                  <td className="px-3 sm:px-4 py-3 font-medium text-sm sm:text-base">{category.name}</td>
                  <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-muted-foreground font-mono">
                    {category.slug}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm">{category._count.products}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <form action={handleUpdate} className="inline">
                        <input type="hidden" name="id" value={category.id} />
                        <div className="flex gap-2">
                          <Input
                            name="name"
                            defaultValue={category.name}
                            className="h-8 w-32 sm:w-48 text-sm"
                            required
                          />
                          <Button type="submit" variant="outline" size="sm">
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </form>
                      <form action={handleDelete} className="inline">
                        <input
                          type="hidden"
                          name="categoryId"
                          value={category.id}
                        />
                        <DeleteButton
                          confirmMessage={`Are you sure you want to delete "${
                            category.name
                          }"? ${
                            category._count.products > 0
                              ? `This category has ${category._count.products} product(s) and cannot be deleted.`
                              : ""
                          }`}
                          disabled={category._count.products > 0}
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
