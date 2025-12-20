"use client";

import React from "react";
import { CommentWithUser } from "@/lib/comments";
import { Card, CardContent } from "@/components/ui/card";
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

  const getUserInitials = (name: string | null) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-l-4 border-l-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {getUserInitials(comment.user.name)}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="font-medium px-2.5 py-1">
                {comment.user.name || "Anonymous"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentItem;
