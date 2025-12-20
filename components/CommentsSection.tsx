import React from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import { getCommentsByProduct } from "@/lib/comments";
import { Separator } from "@/components/ui/separator";

const CommentsSection = async ({ productId }: { productId: string }) => {
  const comments = await getCommentsByProduct(productId);
  return (
    <div className="mt-12 mb-8 px-4">
      <Separator className="mb-8" />
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Comments</h2>
          <p className="text-muted-foreground">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </p>
        </div>
        <CommentForm productId={productId} />
        <CommentList comments={comments} />
      </div>
    </div>
  );
};

export default CommentsSection;
