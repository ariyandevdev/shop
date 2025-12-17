import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string({
      message: "Email is required",
    })
    .min(1, {
      message: "Email is required",
    })
    .email("Please enter a valid email address"),
  password: z
    .string({
      message: "Password is required",
    })
    .min(1, {
      message: "Password is required",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    }),
});

export const RegisterA;

export type SignInSchemaType = z.infer<typeof signInSchema>;
