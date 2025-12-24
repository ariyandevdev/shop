import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { deleteComment } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { FilterSelect } from "@/components/FilterSelect";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

type CommentsPageProps = {
  searchParams: Promise<{
    search?: string;
    product?: string;
    sort?: string;
    page?: string;
  }>;
};

const ITEMS_PER_PAGE = 20;

export default async function AdminCommentsPage({
  searchParams,
}: CommentsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const { search, product, sort, page } = params;
  const currentPage = parseInt(page || "1", 10);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const where: any = {};
  const andConditions: any[] = [];

  // Search filter
  if (search) {
    andConditions.push({
      OR: [
        { content: { contains: search, mode: "insensitive" as const } },
        { user: { email: { contains: search, mode: "insensitive" as const } } },
        {
          product: {
            name: { contains: search, mode: "insensitive" as const },
          },
        },
      ],
    });
  }

  // Product filter
  if (product) {
    andConditions.push({ product: { slug: product } });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sort === "date-asc") {
    orderBy = { createdAt: "asc" };
  }

  // Get total count and comments
  const [totalCount, comments, products] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      select: {
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  async function handleDelete(formData: FormData) {
    "use server";
    const commentId = formData.get("commentId") as string;
    if (commentId) {
      await deleteComment(commentId);
      redirect("/admin/comments");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Comments</h1>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <form action="/admin/comments" method="get" className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              name="search"
              placeholder="Search by content, user, or product..."
              defaultValue={search}
              className="pl-10"
            />
            {product && <input type="hidden" name="product" value={product} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </div>
        </form>
        <div className="w-64">
          <FilterSelect
            name="product"
            defaultValue={product || ""}
            options={[
              { value: "", label: "All Products" },
              ...products.map((p) => ({
                value: p.slug,
                label: p.name,
              })),
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
        <div className="w-48">
          <FilterSelect
            name="sort"
            defaultValue={sort || ""}
            options={[
              { value: "", label: "Newest First" },
              { value: "date-asc", label: "Oldest First" },
            ]}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Comments Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Content
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Sentiment
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No comments found
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="max-w-md">
                      <p className="text-sm line-clamp-2">{comment.content}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {comment.user.name || comment.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {comment.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/product/${comment.product.slug}`}
                      className="text-primary hover:underline text-sm"
                    >
                      {comment.product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {comment.sentiment && (
                      <Badge
                        variant={
                          comment.sentiment === "positive"
                            ? "default"
                            : comment.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {comment.sentiment.charAt(0).toUpperCase() +
                          comment.sentiment.slice(1)}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {comment.sentimentScore !== null &&
                    comment.sentimentScore !== undefined ? (
                      <Badge
                        variant={
                          comment.sentimentScore > 0
                            ? "default"
                            : comment.sentimentScore < 0
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {comment.sentimentScore}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={handleDelete}>
                      <input
                        type="hidden"
                        name="commentId"
                        value={comment.id}
                      />
                      <DeleteButton confirmMessage="Are you sure you want to delete this comment?" />
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Button asChild variant="outline">
              <Link
                href={`/admin/comments?${new URLSearchParams({
                  ...(search && { search }),
                  ...(product && { product }),
                  ...(sort && { sort }),
                  page: (currentPage - 1).toString(),
                }).toString()}`}
              >
                Previous
              </Link>
            </Button>
          )}
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Button asChild variant="outline">
              <Link
                href={`/admin/comments?${new URLSearchParams({
                  ...(search && { search }),
                  ...(product && { product }),
                  ...(sort && { sort }),
                  page: (currentPage + 1).toString(),
                }).toString()}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
