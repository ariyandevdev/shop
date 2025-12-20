"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CommentSchema, CommentSchemaType } from "@/lib/schema";
import { createComment } from "@/lib/comments";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CommentFormProps {
  productId: string;
}

const CommentForm = ({ productId }: CommentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CommentSchemaType>({
    resolver: zodResolver(CommentSchema),
    defaultValues: {
      content: "",
      productId: productId,
    },
  });

  const onSubmit = async (data: CommentSchemaType) => {
    setError(null);
    setIsLoading(true);

    try {
      await createComment(data.productId, data.content);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to post comment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add a comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts about this product..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CommentForm;
