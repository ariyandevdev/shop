"use client";

import React from "react";
import { CommentWithUser } from "@/lib/comments";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const CommentItem = ({ comment }: { comment: CommentWithUser }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              {comment.user.name || "Anonymous"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>
        <Separator className="my-3" />
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </CardContent>
    </Card>
  );
};

export default CommentItem;
