import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string | { toString(): string }
): string {
  // Handle Prisma Decimal type and other types
  const numPrice =
    typeof price === "string"
      ? parseFloat(price)
      : typeof price === "number"
      ? price
      : parseFloat(price.toString());

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
}

/**
 * Handles errors by logging them to console and returning a user-friendly message.
 * Prevents technical/console errors from being shown to users.
 */
export function handleError(
  error: unknown,
  defaultMessage: string = "An error occurred. Please try again."
): string {
  // Log the full error to console for debugging
  console.error("Error:", error);

  // If error is not an Error instance, return default message
  if (!(error instanceof Error)) {
    return defaultMessage;
  }

  const errorMessage = error.message;

  // List of patterns that indicate technical/console errors
  const technicalErrorPatterns = [
    /prisma/i,
    /database/i,
    /sql/i,
    /query/i,
    /invocation/i,
    /unknown argument/i,
    /turbopack/i,
    /__TURBOPACK__/i,
    /node_modules/i,
    /stack trace/i,
    /at \w+ \(/i,
    /\.js:\d+:\d+/i,
  ];

  // Check if error message looks like a technical error
  const isTechnicalError = technicalErrorPatterns.some((pattern) =>
    pattern.test(errorMessage)
  );

  // If it's a technical error, return default message
  if (isTechnicalError) {
    return defaultMessage;
  }

  // For user-friendly errors (like validation errors), return them as-is
  // But only if they're short and don't contain technical details
  if (errorMessage.length > 100) {
    return defaultMessage;
  }

  return errorMessage;
}
