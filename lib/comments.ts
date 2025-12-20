"use server";

import { prisma } from "./prisma";
import { auth } from "./auth";
import { Prisma } from "@prisma/client";

// Server actions for:
// - createComment(productId, content)
// - getCommentsByProduct(productId, page, pageSize)
// - updateComment(commentId, content)
// - deleteComment(commentId)
// - getCommentCount(productId)

export type CommentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export async function createComment(productId: string, content: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const user = session.user;
  if (!user) {
    throw new Error("Unauthorized");
  }
  const comment = await prisma.comment.create({
    data: {
      productId,
      content,
      userId: user.id,
    },
  });
  return comment;
}

export async function getCommentsByProduct(
  productId: string,
  page: number = 1,
  pageSize: number = 10
) {
  const comments = await prisma.comment.findMany({
    where: { productId },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return comments;
}
