"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";
import { hashPassword, comparePassword } from "./password";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: "Failed to fetch user profile",
    };
  }
}

export async function updateProfile(data: {
  name: string;
  email: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  const validationResult = updateProfileSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid data provided",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const { name, email } = validationResult.data;

  try {
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return {
        success: false,
        error: "Email already in use",
        issues: {
          email: ["This email is already registered"],
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    revalidatePath("/account");
    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  const validationResult = changePasswordSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid data provided",
      issues: validationResult.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = validationResult.data;

  try {
    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Verify current password
    const passwordsMatch = await comparePassword(
      currentPassword,
      user.password
    );

    if (!passwordsMatch) {
      return {
        success: false,
        error: "Current password is incorrect",
        issues: {
          currentPassword: ["Current password is incorrect"],
        },
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Failed to change password",
    };
  }
}

