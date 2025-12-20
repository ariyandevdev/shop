import React from "react";
import { CommentWithUser } from "@/lib/comments";
import CommentItem from "./CommentItem";

const CommentList = async ({ comments }: { comments: CommentWithUser[] }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
