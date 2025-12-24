"use server";

import { prisma } from "./prisma";
import { auth } from "./auth";
import { Prisma } from "@prisma/client";
import Sentiment from "sentiment";
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
  const sentiment = new Sentiment();

  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const user = session.user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  const analysis = sentiment.analyze(content);

  const sentimentLabel =
    analysis.score > 0
      ? "positive"
      : analysis.score < 0
      ? "negative"
      : "neutral";

  // 2️⃣ Optional moderation
  if (analysis.score < -5) {
    throw new Error("Comment too negative");
  }
  const comment = await prisma.comment.create({
    data: {
      productId,
      content,
      userId: user.id,
      sentiment: sentimentLabel,
      sentimentScore: analysis.score,
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
