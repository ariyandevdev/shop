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

export const RegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInSchemaType = z.infer<typeof signInSchema>;

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
