import React from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import { getCommentsByProduct } from "@/lib/comments";
import { Separator } from "@/components/ui/separator";

const CommentsSection = async ({ productId }: { productId: string }) => {
  const comments = await getCommentsByProduct(productId);
  return (
    <div className="mt-8">
      <Separator className="my-8" />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Comments</h2>
          <p className="text-muted-foreground text-sm">
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
